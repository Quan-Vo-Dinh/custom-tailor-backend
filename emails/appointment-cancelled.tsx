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

interface AppointmentCancelledEmailProps {
  appointmentId?: string;
  customerName?: string;
  startTime?: string;
}

export const AppointmentCancelledEmail = ({
  appointmentId = "APT-12345",
  customerName = "John Doe",
  startTime = "2025-11-15 10:00 AM",
}: AppointmentCancelledEmailProps) => (
  <Html>
    <Head />
    <Preview>Your appointment has been cancelled</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={heading}>Appointment Cancelled</Text>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Your appointment (ID: <strong>{appointmentId}</strong>) scheduled
            for <strong>{startTime}</strong> has been cancelled.
          </Text>

          <Section style={noticeSection}>
            <Text style={noticeText}>
              ℹ️ If you did not request this cancellation, please contact us
              immediately.
            </Text>
          </Section>

          <Text style={paragraph}>
            If you would like to reschedule, please book a new appointment at
            your convenience.
          </Text>

          <Button style={button} href="https://custom-tailor.com/appointments">
            Book New Appointment
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

export default AppointmentCancelledEmail;

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
  color: "#dc2626",
  marginBottom: "24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.4",
  color: "#404040",
  marginBottom: "16px",
};

const noticeSection = {
  marginBottom: "24px",
  padding: "16px",
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  border: "1px solid #fecaca",
};

const noticeText = {
  fontSize: "14px",
  color: "#7f1d1d",
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const button = {
  backgroundColor: "#dc2626",
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
