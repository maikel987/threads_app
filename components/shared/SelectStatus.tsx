"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  routeType: string;
  statuses: Record<string, string>;
  initial_status?:string;
  actual_query: { [key: string]: any };
}

function StatusSelector({ routeType, statuses,initial_status='',actual_query }: Props) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(initial_status);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    // Mettre à jour ou ajouter le statut sélectionné aux paramètres de recherche actuels
    if (selectedStatus) {
      queryParams.set('status', selectedStatus);
    } else {
      queryParams.delete('status');
    }
    // Conserver les autres paramètres de recherche actuels
    Object.keys(actual_query).forEach(key => {
      if (key !== 'status') { // Évite d'écraser le statut sélectionné
        queryParams.set(key, actual_query[key]);
      }
    });

    const newUrl = `/${routeType}?${queryParams.toString()}`;
    router.push(newUrl);

  }, [selectedStatus, routeType, actual_query, router]);

  return (
    <Select
      value={selectedStatus}
      onValueChange={setSelectedStatus}
    >
      <SelectTrigger className="flex items-center rounded-lg bg-dark-3 px-4 py-2 text-white border border-gray-600 hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white w-[180px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent className="rounded-md border border-gray-600 bg-dark-2">
        <SelectItem key='all' value='all' className="hover:bg-gray-600 mr-4 text-white">
          All
        </SelectItem>
        {
          Object.entries(statuses).map(([statusKey, colorClass]) => (
            <SelectItem key={statusKey} value={statusKey} className={`hover:bg-gray-600 mr-4 ${colorClass}`}>
              {statusKey.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  );
}

export default StatusSelector;
