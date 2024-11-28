// src/components/MainFile.tsx
"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import BookNew from "./bookNew";
import Waiting from "./waiting";
import Upcoming from "./upcoming";
import History from "./history";
import Reminders from "./reminders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import BASE_URL from "@/lib/config";

export default function MainFile() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [appointmentId, setAppointmentId] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [waitingAppointments, setWaitingAppointments] = useState([]);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] =
    useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("book-new");

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  const handleConfirmAppointment = async () => {
    // if (!date || !selectedTime || !selectedReason || !selectedDoctor) {
    //   toast({
    //     title: "Error",
    //     description: "Please select a new date and time.",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    // const url = `${BASE_URL}/appointments`;
    // const method = "POST";

    // const res = await fetch(url, {
    //   method,
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     patientId: 1,
    //     doctorId: selectedDoctor,
    //     date: format(date, "MMMM d, yyyy"),
    //     time: selectedTime,
    //     appointmentType: selectedReason,
    //     additionalNotes: additionalNotes,
    //     status: "waiting",
    //   }),
    // });

    // if (res.ok) {
    //   fetchAllData();
    // } else {
    //   alert("Error saving data");
    // }
    alert(selectedReason);

    // Reset form
    setDate(new Date());
    setSelectedTime(null);
    setSelectedDoctor(null);
    setSelectedReason(null);
    setAdditionalNotes("");

    // Switch to the Waiting tab
    setActiveTab("waiting");
  };

  const handleCancelBooking = () => {
    // Reset form
    setDate(new Date());
    setSelectedTime(null);
    setSelectedDoctor(null);
    setSelectedReason(null);
    setAdditionalNotes("");

    toast({
      title: "Booking Cancelled",
      description: "Your appointment booking has been cancelled.",
    });
  };

  const handleReschedule = (appointment) => {
    setAppointmentToReschedule(appointment);
    setIsRescheduleDialogOpen(true);
    setAppointmentId(appointment.id);
  };

  const handleConfirmReschedule = async () => {
    if (!date || !selectedTime) {
      toast({
        title: "Error",
        description: "Please select a new date and time.",
        variant: "destructive",
      });
      return;
    }

    const url = `${BASE_URL}/appointments/${appointmentId}`;
    const method = "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // date: "2030-11-30T10:00:00.000Z",
        // time: "2040-11-30T10:00:00.000Z",
        date: format(date, "MMMM d, yyyy"),
        time: selectedTime,
        status: "waiting",
      }),
    });

    if (res.ok) {
      fetchAllData(); // Refresh users list
    } else {
      alert("Error saving data");
    }

    setIsRescheduleDialogOpen(false);
    setAppointmentToReschedule(null);
    setDate(new Date());
    setSelectedTime(null);
    setActiveTab("waiting");
  };

  const handleCancel = async (appointmentId) => {
    const url = `${BASE_URL}/appointments/${appointmentId}`;
    const method = "DELETE";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      fetchAllData(); // Refresh users list
    } else {
      alert("Error saving data");
    }

    toast({
      title: "Appointment Cancelled",
      description: "Your appointment has been cancelled successfully.",
    });
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointmentDetails(appointment);
    setIsDetailsDialogOpen(true);
  };

  const today = new Date();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const disabledDates = ["2024-11-25", "2024-12-31"];

  // Function to handle date selection, with disabled dates check
  const handleSelectDate = (selectedDate) => {
    const isDisabled = disabledDates.some(
      (disabledDate) =>
        new Date(disabledDate).toDateString() === selectedDate.toDateString()
    );
    if (!isDisabled) {
      setDate(selectedDate);
    }
  };

  const fetchAllData = async () => {
    const resAppointments = await fetch(`${BASE_URL}/appointments`);
    const appointmentsData = await resAppointments.json();
    const resDoctors = await fetch(`https://newdentalapi.onrender.com/doctors`);
    const doctorsData = await resDoctors.json();
    const resResons = await fetch(`https://newdentalapi.onrender.com/types`);
    const reasonsData = await resResons.json();

    // setAppointments(appointmentsData);
    setUpcomingAppointments(
      appointmentsData.filter(
        (appointment) => appointment.status === "upcoming"
      )
    );
    setWaitingAppointments(
      appointmentsData.filter((appointment) => appointment.status === "waiting")
    );
    setAppointmentHistory(
      appointmentsData.filter(
        (appointment) =>
          appointment.status === "upcoming" ||
          appointment.status === "completed"
      )
    );
    setDoctors(doctorsData);
    setReasons(reasonsData);
  };
  useEffect(() => {
    fetchAllData();
  }, [
    upcomingAppointments,
    waitingAppointments,
    appointmentHistory,
    doctors,
    reasons,
  ]);
  return (
    <div className="w-full max-w-6xl mx-auto">
      <main>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center dark:text-white">
          Appointments
        </h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <TabsTrigger
              value="book-new"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-white"
            >
              Book New
            </TabsTrigger>
            <TabsTrigger
              value="waiting"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-white"
            >
              Waiting
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-white"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-white"
            >
              History
            </TabsTrigger>
            <TabsTrigger
              value="reminders"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-white"
            >
              Reminders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book-new">
            <BookNew
              doctors={doctors}
              date={date}
              setDate={setDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              selectedDoctor={selectedDoctor}
              setSelectedDoctor={setSelectedDoctor}
              selectedReason={selectedReason}
              setSelectedReason={setSelectedReason}
              additionalNotes={additionalNotes}
              setAdditionalNotes={setAdditionalNotes}
              handleConfirmAppointment={handleConfirmAppointment}
              handleCancelBooking={handleCancelBooking}
              timeSlots={timeSlots}
              reasons={reasons}
              handleSelectDate={handleSelectDate}
            />
          </TabsContent>
          <TabsContent value="waiting">
            <Waiting
              waitingAppointments={waitingAppointments}
              handleReschedule={handleReschedule}
              handleCancel={handleCancel}
            />
          </TabsContent>
          <TabsContent value="upcoming">
            <Upcoming
              upcomingAppointments={upcomingAppointments}
              handleReschedule={handleReschedule}
              handleCancel={handleCancel}
            />
          </TabsContent>

          <TabsContent value="history">
            <History
              appointmentHistory={appointmentHistory}
              handleViewDetails={handleViewDetails}
            />
          </TabsContent>

          <TabsContent value="reminders">
            <Reminders />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Please select a new date and time for your appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  fromDate={today}
                  className="rounded-md border"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Time
              </Label>
              <Select
                value={selectedTime || ""}
                onValueChange={setSelectedTime}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRescheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmReschedule}>
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointmentDetails && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Date:</Label>
                <div className="col-span-3">
                  {selectedAppointmentDetails.date}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Time:</Label>
                <div className="col-span-3">
                  {selectedAppointmentDetails.time}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Doctor:</Label>
                <div className="col-span-3">
                  {selectedAppointmentDetails.doctor.firstName}{" "}
                  {selectedAppointmentDetails.doctor.lastName}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Reason:</Label>
                <div className="col-span-3">
                  {selectedAppointmentDetails.appointmentType}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Outcome:</Label>
                <div className="col-span-3">
                  {selectedAppointmentDetails.status}
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right font-bold">Notes:</Label>
                <div className="col-span-3">
                  {selectedAppointmentDetails.additionalNotes}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
