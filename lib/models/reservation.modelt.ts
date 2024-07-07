import mongoose, { Document } from "mongoose";

interface IGuests extends Document {
    total: number;
    adult_count: number;
    child_count: number;
    infant_count: number;
    pet_count: number;
}

interface IReservationStatus extends Document {
    current: {
        category: string;
        sub_category: string | null;
    };
    history: any[];
}

export interface IReservation extends Document {
    code: string;
    platform: string;
    platform_id: string;
    booking_date: Date;
    arrival_date: Date;
    departure_date: Date;
    check_in: Date;
    check_out: Date;
    reservation_status: IReservationStatus;
    conversation_id: mongoose.Types.ObjectId;
    guests: IGuests;
    listings: [{ platform: string; platform_id: string }];
    guest: {
        email: string | null;
        phone_numbers: string[];
        first_name: string;
        last_name: string;
    };
    status: string;
    status_history: any[];
    conversation: mongoose.Types.ObjectId[];
}

const guestsSchema = new mongoose.Schema({
    total: Number,
    adult_count: Number,
    child_count: Number,
    infant_count: Number,
    pet_count: Number
});

const reservationStatusSchema = new mongoose.Schema({
    current: {
        category: String,
        sub_category: String
    },
    history: Array
});

const reservationSchema = new mongoose.Schema({
    code: String,
    platform: String,
    platform_id: String,
    booking_date: Date,
    arrival_date: Date,
    departure_date: Date,
    check_in: Date,
    check_out: Date,
    reservation_status: reservationStatusSchema,
    conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    guests: guestsSchema,
    listings: [{
        platform: String,
        platform_id: String
    }],
    guest: {
        email: String,
        phone_numbers: [String],
        first_name: String,
        last_name: String
    },
    status: String,
    status_history: Array,
    conversation: [{ type: mongoose.Schema.Types.ObjectId, ref: "Conversation" }]
});

const Reservation = mongoose.model<IReservation>("Reservation", reservationSchema);
