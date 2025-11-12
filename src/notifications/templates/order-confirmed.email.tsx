import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface OrderConfirmedEmailProps {
  orderId: string;
  customerName: string;
  totalAmount: number;
  items: Array<{ productName: string; quantity: number; price: number }>;
}

export const OrderConfirmedEmail = ({
  orderId,
  customerName,
  totalAmount,
  items,
}: OrderConfirmedEmailProps) => (
  <Html>
    <Head />
    <Preview>Your order #{orderId} has been confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={heading}>Order Confirmed</Text>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Thank you for your order! We're excited to start creating your
            custom tailored clothing.
          </Text>

          <Section style={orderSection}>
            <Text style={sectionHeading}>Order Details</Text>
            <Row>
              <Text style={label}>Order ID:</Text>
              <Text style={value}>{orderId}</Text>
            </Row>

            <Text style={itemsHeading}>Items:</Text>
            {items.map((item, index) => (
              <Row key={index}>
                <Text style={itemText}>
                  {item.productName} x {item.quantity} -{" "}
                  {item.price.toLocaleString()} VND
                </Text>
              </Row>
            ))}

            <Hr style={hr} />
            <Row>
              <Text style={totalLabel}>Total:</Text>
              <Text style={totalValue}>{totalAmount.toLocaleString()} VND</Text>
            </Row>
          </Section>

          <Text style={paragraph}>
            Our team will process your order and send you updates as we progress
            through each stage.
          </Text>

          <Button style={button} href="https://custom-tailor.com/orders">
            View Your Order
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

const orderSection = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
};

const sectionHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#000",
  marginBottom: "12px",
};

const label = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#666",
};

const value = {
  fontSize: "14px",
  color: "#000",
  marginLeft: "8px",
};

const itemsHeading = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#000",
  marginTop: "12px",
  marginBottom: "8px",
};

const itemText = {
  fontSize: "14px",
  color: "#404040",
  marginBottom: "4px",
};

const totalLabel = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#000",
};

const totalValue = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#1f2937",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const button = {
  backgroundColor: "#000000",
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
