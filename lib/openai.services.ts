
import { OpenAI, ClientOptions } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { IApartment } from './models/apartment.model';
import { model } from 'mongoose';


if (!process.env.MODEL_BEST) {
    throw new Error('MODEL_BEST is not defined in the environment variables.');
}
const best_model_gpt = process.env.MODEL_BEST;

if (!process.env.MODEL) {
    throw new Error('MODEL is not defined in the environment variables.');
}
const model_gpt = process.env.MODEL;

const apiKey = process.env.GPT_API_KEY;
if (!apiKey) {
  throw new Error('GPT_API_KEY is not defined');
}

const client = new OpenAI({ apiKey });

// Rest of the code...
// Function to get embedding
export async function getEmbedding(text: string): Promise<number[]> {
    const response = await client.embeddings.create({
        input: text,
        model: "text-embedding-ada-002"
    });
    return response.data[0].embedding;
}

// Function to get FAQ from conversation
export async function getFaq(conversation: string): Promise<string[]> {
    const prompt = `
        Create a helpful FAQ in English for future guests from the following conversation. 
        The FAQ should provide general and useful information suitable for a wide audience. 
        Follow these guidelines:

        1. Include:
            - General Questions: Extract frequently asked questions or those that appear useful for a general audience.
            - Helpful Answers: Provide clear, precise, and relevant information.
            - Factual Information: Include details about services, policies, procedures, and specific check-in information like the apartment's address.
            - Tips and Tricks: Practical recommendations beneficial for the majority.
            - Common Themes: Topics of general interest.
        2. Exclude:
            - Personal Data: Avoid names, contacts, and other identifiable information.
            - Individual-Specific Details: Issues or concerns unique to the individual.
            - Subjective Opinions or Personal Anecdotes: Unless broadly applicable.
            - Sensitive or Confidential Information: Such as security, health, or financial data.
            - Inappropriate or Offensive Language.
        3. Format:
            - Format each entry as follows: 'Q: [Question in English]' followed by 'A: [Answer in English]'.
            - Insert a '###' after each answer for clear separation.

        The goal is to create an FAQ that is informative, respectful of privacy, and directly applicable to the needs of future travelers.
    `;

    const completion = await client.chat.completions.create({
        model: best_model_gpt,
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: conversation }
        ]
    });

// Suppose que completion est correctement défini et qu'il a potentiellement un choix valide.
const result = completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content
    ? completion.choices[0].message.content.split("###")
        .map(elt => elt.trim())
        .filter(elt => elt !== '')
    : [];

console.log(result);


    console.log("len result: ", result.length);
    return result;
}

// Function to get response from ChatGPT with summary
export async function getResponseFromChatGPTAndSummary(conversation: ConversationModel, contextData: string, apartmentInstance?: IApartment): Promise<string> {
    const messages:ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: `You are a knowledgeable and friendly Airbnb host assistant. Your task is to respond to guests' messages in a way that is warm, welcoming, professional, and informative. 
                      Use the provided context about the apartment to offer accurate and helpful information. Personalize your responses when appropriate, be clear and concise in your communication, and maintain a positive and respectful tone at all times. Remember to adapt your tone to match the formality or informality of the guest's message. Don't hesitate to use smiley. Context (to use only if needed): ${contextData}`
        },
        ...conversation.toDictList()
    ];

    const completion = await client.chat.completions.create({
        model: model_gpt,
        messages: messages
    });

    const result = completion.choices[0].message.content?completion.choices[0].message.content:'';
    console.log("len result: ", result.length);
    return result;
}

// Function to get response from ChatGPT
export async function getResponseFromChatGPT(conversation: ConversationModel, contextData: string, apartmentInstance?: IApartment): Promise<string> {
    const lastConversation = getLastMessagesCycles(conversation, 2);

    const messages:ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: `You are a knowledgeable and friendly Airbnb host assistant. Your main task is to respond to guests' messages in a way that is warm, welcoming, professional, and informative.`
        },
        ...lastConversation.slice(0, -1),
        {
            role: "assistant",
            content: `Use the context and the apartment information to answer the guest question. 
                      Personalize your responses, be clear and concise, and maintain a positive and respectful tone. 
                      Important: Use as much as emojis as you can, and line breaks to make the message clear and readable. And don't sign the message.
                      If you don't have information, you can put some [square brackets].

                      Reservation information:
                      - Reservation status: ${conversation.reservationStatus}
                      - Guest name: ${conversation.guestName}
                      - Date and guest number: ${conversation.bookingInfo}

                      Context (use only if needed):
                      We are the ${new Date().toUTCString()} UTC (important for check-in and check-out possibility).
                      ${apartmentInstance ? `Address: ${apartmentInstance.address}` : ''}
                      ${contextData}

                      Message to answer:
                      ${conversation.toString()}`
        }
    ];

    const completion = await client.chat.completions.create({
        model: model_gpt,
        messages: messages
    });

    const result = completion.choices[0].message.content?completion.choices[0].message.content:'';
    console.log("len result: ", result.length);
    return result;
}

// Function to get response from ChatGPT with provided context
export async function getResponseFromChatGPTContextProvided(conversation: ConversationModel, contextData: string, apartmentInstance: IApartment): Promise<string> {
    const messages:ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: `You are a knowledgeable and friendly Airbnb host assistant. Your task is to respond to guests' messages in a way that is warm, welcoming, professional, and informative.`
        },
        {
            role: "assistant",
            content: `Use the provided context about the apartment to offer accurate and helpful information. Personalize your responses when appropriate, be clear and concise in your communication, and maintain a positive and respectful tone at all times. 
                      Remember to adapt your tone to match the formality or informality of the guest's message. 
                      Important: Use as much as emojis as you can, and line breaks to make the message clear and readable. And don't sign the message.

                      Message to answer:
                      ${conversation.message[conversation.message.length - 1].toString()}
                      Context (to use only if needed):
                      We are the ${new Date().toUTCString()} UTC (important for check-in and check-out possibility).
                      ${apartmentInstance ? `Address: ${apartmentInstance.address}` : ''}

                      Important Instruction:
                      ${contextData}`
        }
    ];

    const completion = await client.chat.completions.create({
        model: model_gpt,
        messages: messages
    });

    const result = completion.choices[0].message.content?completion.choices[0].message.content:'';
    console.log("len result: ", result.length);
    return result;
}
