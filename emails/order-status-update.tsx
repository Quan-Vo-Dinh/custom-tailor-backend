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

interface OrderStatusUpdateEmailProps {
  orderId?: string;
  customerName?: string;
  status?: string;
  updatedAt?: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; emoji: string }
> = {
  PENDING: { label: "Pending", color: "#92400e", bg: "#fef3c7", emoji: "⏳" },
  CONFIRMED: {
    label: "Confirmed",
    color: "#065f46",
    bg: "#d1fae5",
    emoji: "✓",
  },
  MEASURING: {
    label: "Taking Measurements",
    color: "#1e40af",
    bg: "#dbeafe",
    emoji: "📏",
  },
  IN_PRODUCTION: {
    label: "In Production",
    color: "#6b21a8",
    bg: "#f3e8ff",
    emoji: "✂️",
  },
  QUALITY_CHECK: {
    label: "Quality Check",
    color: "#be123c",
    bg: "#fce7f3",
    emoji: "🔍",
  },
  READY_FOR_DELIVERY: {
    label: "Ready for Delivery",
    color: "#0f766e",
    bg: "#ccfbf1",
    emoji: "📦",
  },
  DELIVERED: {
    label: "Delivered",
    color: "#15803d",
    bg: "#dcfce7",
    emoji: "🎉",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#991b1b",
    bg: "#fee2e2",
    emoji: "❌",
  },
};

export const OrderStatusUpdateEmail = ({
  orderId = "ORD-78910",
  customerName = "Jane Smith",
  status = "IN_PRODUCTION",
  updatedAt = "November 12, 2025 at 3:45 PM",
}: OrderStatusUpdateEmailProps) => {
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Html>
      <Head />
      <Preview>
        Your order #{orderId} status has been updated to {config.label}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>Order Status Updated</Text>
            <Text style={paragraph}>Hi {customerName},</Text>
            <Text style={paragraph}>
              Your order <strong>#{orderId}</strong> has a new update!
            </Text>

            <Section style={{ ...statusSection, backgroundColor: config.bg }}>
              <Text style={statusLabel}>Current Status:</Text>
              <Text style={{ ...statusBadge, color: config.color }}>
                {config.emoji} {config.label}
              </Text>
              <Text style={updatedAtText}>Updated on {updatedAt}</Text>
            </Section>

            <Section style={timelineSection}>
              <Text style={timelineHeading}>Order Timeline:</Text>
              {getTimeline(status).map((step, index) => (
                <Row key={index} style={timelineItem}>
                  <Text style={step.active ? timelineStepActive : timelineStep}>
                    {step.active ? "●" : "○"} {step.label}
                  </Text>
                </Row>
              ))}
            </Section>

            <Text style={paragraph}>
              We'll keep you informed about any further updates to your order.
            </Text>

            <Button style={button} href="https://custom-tailor.com/orders">
              View Order Details
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
};

export default OrderStatusUpdateEmail;

// Helper to generate timeline
const getTimeline = (currentStatus: string) => {
  const steps = [
    "PENDING",
    "CONFIRMED",
    "MEASURING",
    "IN_PRODUCTION",
    "QUALITY_CHECK",
    "READY_FOR_DELIVERY",
    "DELIVERED",
  ];

  const currentIndex = steps.indexOf(currentStatus);

  return steps.map((step, index) => ({
    label: statusConfig[step]?.label || step,
    active: index <= currentIndex,
  }));
};

const Row = ({ children, style }: any) => <div style={style}>{children}</div>;

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
  color: "#6366f1",
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
  padding: "24px",
  borderRadius: "8px",
  textAlign: "center" as const,
};

const statusLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#666",
  marginBottom: "12px",
  margin: "0 0 12px 0",
};

const statusBadge = {
  fontSize: "24px",
  fontWeight: "700",
  padding: "12px 24px",
  borderRadius: "8px",
  display: "inline-block",
  margin: "0",
};

const updatedAtText = {
  fontSize: "12px",
  color: "#666",
  marginTop: "12px",
  margin: "12px 0 0 0",
};

const timelineSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

const timelineHeading = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#000",
  marginBottom: "16px",
};

const timelineItem = {
  marginBottom: "8px",
};

const timelineStep = {
  fontSize: "14px",
  color: "#9ca3af",
  margin: "0",
};

const timelineStepActive = {
  fontSize: "14px",
  color: "#1f2937",
  fontWeight: "600",
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const button = {
  backgroundColor: "#6366f1",
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
