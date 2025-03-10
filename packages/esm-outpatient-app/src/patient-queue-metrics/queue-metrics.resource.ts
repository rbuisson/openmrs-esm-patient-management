import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { AppointmentSummary, QueueServiceInfo } from '../types';
import { getServiceCountByAppointmentType } from '../helpers/helpers';

interface ConceptMetadataResponse {
  setMembers: Array<{
    display: string;
    uuid: string;
  }>;
}

export function useMetrics() {
  const metrics = { scheduled_appointments: 100, average_wait_time: 28, patients_waiting_for_service: 182 };
  const { data, error } = useSWR<{ data: { results: {} } }, Error>(`/ws/rest/v1/queue?`, openmrsFetch);

  return {
    // Returns placeholder mock data, soon to be replaced with actual data from the backend
    metrics: metrics,
    isError: error,
    isLoading: !data && !error,
  };
}

export function useServices(location: string) {
  const apiUrl = `/ws/rest/v1/queue?location=${location}`;
  const { data } = useSWRImmutable<{ data: { results: Array<QueueServiceInfo> } }, Error>(apiUrl, openmrsFetch);

  return {
    services: data ? data?.data?.results?.map((service) => service.display) : [],
    allServices: data ? data?.data.results : [],
  };
}

export function useServiceMetricsCount(service: string) {
  const status = 'Waiting';
  const apiUrl = `/ws/rest/v1/queue-entry-metrics?service=${service}&status=${status}`;
  const { data } = useSWRImmutable<
    {
      data: {
        count: number;
      };
    },
    Error
  >(apiUrl, openmrsFetch);

  return {
    serviceCount: data ? data?.data?.count : 0,
  };
}

export const useAppointmentMetrics = () => {
  const startDate = dayjs(new Date().setHours(0, 0, 0, 0)).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
  const endDate = dayjs(new Date().setHours(23, 59, 59, 59)).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

  const url = `/ws/rest/v1/appointment/appointmentSummary?startDate=${startDate}&endDate=${endDate}`;
  const { data, error, mutate } = useSWR<{
    data: Array<AppointmentSummary>;
  }>(url, openmrsFetch);

  const totalScheduledAppointments = getServiceCountByAppointmentType(data?.data ?? [], 'allAppointmentsCount');

  return {
    isLoading: !data && !error,
    error,
    totalScheduledAppointments,
  };
};
