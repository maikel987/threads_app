import Conversation from '../models/conversation.model';
import Listing, { IListing } from '../models/listing.model';
import Reservation from '../models/reservation.modelt';
import { IHospitableMessage, IHospitableReservation } from './hospitable.actions';
//####


export async function integrateReservationData(reservations: IHospitableReservation[], messagesMap: Map<string, IHospitableMessage[]>, listing:IListing) {
  console.log(`Starting to integrate ${reservations.length} reservations.`); // # Log pour indiquer le début de l'intégration

  for (let reservation of reservations) {
    try {
      console.log(`Processing reservation: ${reservation.id}`); // # Log pour indiquer la réservation en cours de traitement

      // Créez ou mettez à jour la réservation dans la base de données
      const savedReservation = await Reservation.findOneAndUpdate(
        { platform_id: reservation.platform_id },
        {
          listing: listing._id,
          internal_id:reservation.id,
          code: reservation.code,
          platform: reservation.platform,
          platform_id: reservation.platform_id,
          booking_date: new Date(reservation.booking_date),
          arrival_date: new Date(reservation.arrival_date),
          departure_date: new Date(reservation.departure_date),
          check_in: new Date(reservation.check_in),
          check_out: new Date(reservation.check_out),
          reservation_status: reservation.reservation_status,
          guests: reservation.guests,
          listings: reservation.listings,
          guest: reservation.guest,
          status: reservation.status,
          status_history: reservation.status_history,
          conversation: []
        },
        { upsert: true, new: true }
      );

      // Regrouper les messages pour la réservation
      const messages = messagesMap.get(reservation.id) || [];
      console.log(`Found ${messages.length} messages for reservation ${reservation.id}`);

      // Créer une seule conversation pour tous les messages
      if (messages.length > 0) {
        const conversation = new Conversation({
          messages: messages.map(message => ({
            content_type: message.content_type,
            reservation: savedReservation._id,
            body: message.body,
            attachments: message.attachments,
            sender_type: message.sender_type,
            sender_role: message.sender_role,
            sender: message.sender,
            created_at: new Date(message.created_at)
          }))
        });

        const savedConversation = await conversation.save();
        savedReservation.conversation = [savedConversation._id]; // Associer l'ID de la conversation à la réservation
        console.log(`Saved conversation with ID: ${savedConversation._id} for reservation ${reservation.id}`);
      }

      await savedReservation.save(); // Sauvegarde la réservation mise à jour
      console.log(`Updated reservation ${savedReservation._id} with conversation IDs.`);

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error processing reservation ${reservation.id}:`, error.message);
      } else {
        console.error(`Unknown error processing reservation ${reservation.id}:`, error);
      }
    }
  }
  console.log('Data integration completed.'); // # Log pour indiquer que l'intégration des données est terminée
}
