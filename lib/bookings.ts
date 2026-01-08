export const BOOKING_TRACKING_MESSAGES: Record<string, { title: string; message: string }> = {
    needs_confirmation: {
        title: "Needs Confirmation",
        message: "(System) Booking is awaiting initial confirmation.",
    },
    pending_review: {
        title: "For review",
        message: "You have been assigned a new booking. Kindly review the booking details and complete the necessary action.",
    },
    accepted: {
        title: "Accepted",
        message: "You have successfully confirmed the booking.",
    },
    dispatched: {
        title: "Dispatched",
        message: "You are getting ready to go to the location.",
    },
    on_the_way: {
        title: "On the way",
        message: "You are on your way to the location.",
    },
    arrived: {
        title: "Arrived",
        message: "You have arrived at the customer's location.",
    },
    in_progress: {
        title: "In Progress",
        message: "The service is currently in progress.",
    },
    completed: {
        title: "Completed",
        message: "You have successfully completed the service.",
    },
    rescheduled: {
        title: "Rescheduled",
        message: "The booking has been rescheduled.",
    },
    cancelled: {
        title: "Cancelled",
        message: "The booking has been cancelled.",
    },
};
