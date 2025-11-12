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

interface OrderStatusUpdateEmailProps {
  orderId: string;
  customerName: string;
  status: string;
  updatedAt: string;
}

export const OrderStatusUpdateEmail = ({
  orderId,
  customerName,
  status,
  updatedAt,
}: OrderStatusUpdateEmailProps) => (
  <Html>
    <Head />
    <Preview>Your order #{orderId} status has been updated</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={heading}>Order Status Updated</Text>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Your order <strong>#{orderId}</strong> status has been updated.
          </Text>

          <Section style={statusSection}>
            <Text style={statusLabel}>Current Status:</Text>
            <Text style={statusBadge}>{status}</Text>
            <Text style={updatedAtText}>Updated on {updatedAt}</Text>
          </Section>

          <Text style={paragraph}>
            We'll keep you informed about any further updates to your order.
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

const statusSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  textAlign: "center" as const,
};

const statusLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#666",
  marginBottom: "12px",
};

const statusBadge = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#1f2937",
  padding: "8px 16px",
  backgroundColor: "#e5e7eb",
  borderRadius: "4px",
  display: "inline-block",
};

const updatedAtText = {
  fontSize: "12px",
  color: "#999",
  marginTop: "12px",
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
