import mongoose, { Document } from "mongoose";

interface IMessage extends Document {
    content_type: string;
    body: string;
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
    content_type: String,
    body: String,
    attachments: Array,
    sender_type: String,
    sender_role: String,
    sender: {
        first_name: String,
        full_name: String,
        locale: String,
        picture_url: String,
        thumbnail_url: String,
        location: String
    },
    created_at: Date
});

const conversationSchema = new mongoose.Schema({
    messages: [messageSchema]
});

const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
