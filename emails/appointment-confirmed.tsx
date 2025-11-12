import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AppointmentConfirmedEmailProps {
  appointmentId?: string;
  customerName?: string;
  startTime?: string;
  endTime?: string;
}

export const AppointmentConfirmedEmail = ({
  appointmentId = "APT-12345",
  customerName = "John Doe",
  startTime = "2025-11-15 10:00 AM",
  endTime = "2025-11-15 11:00 AM",
}: AppointmentConfirmedEmailProps) => (
  <Html>
    <Head />
    <Preview>Your appointment has been confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={heading}>Appointment Confirmed ✓</Text>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Your appointment has been confirmed. We look forward to seeing you!
          </Text>

          <Section style={appointmentSection}>
            <Text style={sectionHeading}>Appointment Details</Text>
            <Text style={detailRow}>
              <strong>Appointment ID:</strong> {appointmentId}
            </Text>
            <Text style={detailRow}>
              <strong>Date & Time:</strong> {startTime} - {endTime}
            </Text>
          </Section>

          <Text style={paragraph}>
            Please arrive 5-10 minutes early. If you need to reschedule, please
            contact us as soon as possible.
          </Text>

          <Button style={button} href="https://custom-tailor.com/appointments">
            View Your Appointments
          </Button>

          <Hr style={hr} />
          <Text style={footer}>
            Custom Tailor © 2025. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default AppointmentConfirmedEmail;

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#16a34a",
  marginBottom: "24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.4",
  color: "#404040",
  marginBottom: "16px",
};

const appointmentSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  border: "1px solid #bbf7d0",
};

const sectionHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#000",
  marginBottom: "12px",
};

const detailRow = {
  fontSize: "14px",
  color: "#404040",
  marginBottom: "8px",
  lineHeight: "1.5",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const button = {
  backgroundColor: "#16a34a",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  marginTop: "24px",
};

const footer = {
  color: "#666",
  fontSize: "12px",
  lineHeight: "1.4",
  marginTop: "12px",
};
