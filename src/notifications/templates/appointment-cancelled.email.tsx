import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AppointmentCancelledEmailProps {
  appointmentId: string;
  customerName: string;
  startTime: string;
}

export const AppointmentCancelledEmail = ({
  appointmentId,
  customerName,
  startTime,
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
            Your appointment scheduled for <strong>{startTime}</strong> has been
            cancelled.
          </Text>

          <Text style={paragraph}>
            If you would like to reschedule, please visit our website or contact
            us directly.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            Custom Tailor © 2025. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

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
  color: "#000",
  marginBottom: "24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.4",
  color: "#404040",
  marginBottom: "16px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  color: "#666",
  fontSize: "12px",
  lineHeight: "1.4",
  marginTop: "12px",
};
