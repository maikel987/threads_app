"use server";
import mongoose, { Document } from "mongoose";

interface IMessage extends Document {
    content_type: string;
    reservation: mongoose.Types.ObjectId;
    body: string|null;
    attachments: any[];
    sender_type: string;
    sender_role: string | null;
    sender: {
        first_name: string;
        full_name: string;
        locale: string;
        picture_url: string;
        thumbnail_url: string;
        location: string;
    };
    created_at: Date;
}

export interface IConversation extends Document {
    messages: IMessage[];
}

const messageSchema = new mongoose.Schema({
    content_type: {
        type: String,
        required: true  // Assuming every message must have a content type
    },
    reservation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Reservation",
        required: true  
    },
    body: {
        type: String,
        required: false  // Assuming the body is essential for a message
    },
    attachments: {
        type: Array,
        required: false  // Attachments might not always be necessary
    },
    sender_type: {
        type: String,
        required: true  // Necessary to understand the context of the message
    },
    sender_role: {
        type: String,
        required: false  // Role might not be necessary in all contexts
    },
    sender: {
        first_name: {
            type: String,
            required: false  // Sender's first name might not always be necessary
        },
        full_name: {
            type: String,
            required: true  // Full name could be essential for identification
        },
        locale: {
            type: String,
            required: false  // Locale might not always be necessary
        },
        picture_url: {
            type: String,
            required: false  // Picture URL might not always be necessary
        },
        thumbnail_url: {
            type: String,
            required: false  // Thumbnail URL might not always be necessary
        },
        location: {
            type: String,
            required: false  // Location might not always be necessary
        }
    },
    created_at: {
        type: Date,
        default: Date.now,  // Automatically set the creation time
        required: true
    }
});

const conversationSchema = new mongoose.Schema({
    messages: [messageSchema]
});

const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", conversationSchema);
export default Conversation;
