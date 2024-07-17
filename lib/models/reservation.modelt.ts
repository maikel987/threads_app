"use server";
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
    listing: mongoose.Types.ObjectId;
    internal_id: string;
    code: string;
    platform: string;
    platform_id: string;
    booking_date: Date;
    arrival_date: Date;
    departure_date: Date;
    check_in: Date;
    check_out: Date;
    reservation_status: IReservationStatus;
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
    listing: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Listing",
        required: true  // Assumant que chaque réservation doit être liée à une annonce
    },
    internal_id: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: true
    },
    platform_id: {
        type: String,
        required: true
    },
    booking_date: {
        type: Date,
        required: true
    },
    arrival_date: {
        type: Date,
        required: true
    },
    departure_date: {
        type: Date,
        required: true
    },
    check_in: {
        type: Date,
        required: true
    },
    check_out: {
        type: Date,
        required: true
    },
    reservation_status: {
        type: reservationStatusSchema,
        required: true
    },
    guests: {
        type: guestsSchema,
        required: true
    },
    listings: [{
        platform: {
            type: String,
            required: true
        },
        platform_id: {
            type: String,
            required: true
        }
    }],
    guest: {
        email: {
            type: String,
            required: false  // Email might not be mandatory
        },
        phone_numbers: {
            type: [String],
            required: true
        },
        first_name: {
            type: String,
            required: false
        },
        last_name: {
            type: String,
            required: false
        }
    },
    status: {
        type: String,
        required: true
    },
    status_history: {
        type: Array,
        required: false  // History might not be mandatory
    },
    conversation: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: false  // Conversations might not be available at the time of creation
    }]
});


const Reservation = mongoose.models.Reservation ||mongoose.model<IReservation>("Reservation", reservationSchema);
export default Reservation;
