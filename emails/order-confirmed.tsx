import * as React from "react";
import {
  Body,
  Button,
  Column,
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
  orderId?: string;
  customerName?: string;
  totalAmount?: number;
  items?: Array<{ productName: string; quantity: number; price: number }>;
}

export const OrderConfirmedEmail = ({
  orderId = "ORD-78910",
  customerName = "Jane Smith",
  totalAmount = 2500000,
  items = [
    { productName: "Custom Suit - Navy Blue", quantity: 1, price: 1500000 },
    { productName: "Dress Shirt - White", quantity: 2, price: 500000 },
  ],
}: OrderConfirmedEmailProps) => (
  <Html>
    <Head />
    <Preview>Your order #{orderId} has been confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={heading}>Order Confirmed 🎉</Text>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Thank you for your order! We're excited to start creating your
            custom tailored clothing.
          </Text>

          <Section style={orderSection}>
            <Text style={sectionHeading}>Order Details</Text>
            <Row>
              <Column>
                <Text style={label}>Order ID:</Text>
              </Column>
              <Column align="right">
                <Text style={value}>{orderId}</Text>
              </Column>
            </Row>

            <Text style={itemsHeading}>Items:</Text>
            <Section style={itemsList}>
              {items.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column>
                    <Text style={itemText}>
                      {item.productName}{" "}
                      <span style={quantityBadge}>x{item.quantity}</span>
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text style={priceText}>
                      {item.price.toLocaleString()} VND
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr style={hr} />
            <Row>
              <Column>
                <Text style={totalLabel}>Total:</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>
                  {totalAmount.toLocaleString()} VND
                </Text>
              </Column>
            </Row>
          </Section>

          <Text style={paragraph}>
            Our team will process your order and send you updates as we progress
            through each stage of production.
          </Text>

          <Button style={button} href="https://custom-tailor.com/orders">
            Track Your Order
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

export default OrderConfirmedEmail;

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
  color: "#2563eb",
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
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  border: "1px solid #bfdbfe",
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
  margin: "0",
};

const value = {
  fontSize: "14px",
  color: "#000",
  fontWeight: "600",
  margin: "0",
};

const itemsHeading = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#000",
  marginTop: "16px",
  marginBottom: "12px",
};

const itemsList = {
  marginBottom: "12px",
};

const itemRow = {
  marginBottom: "8px",
};

const itemText = {
  fontSize: "14px",
  color: "#404040",
  margin: "0",
};

const quantityBadge = {
  backgroundColor: "#dbeafe",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "600",
  marginLeft: "8px",
};

const priceText = {
  fontSize: "14px",
  color: "#1f2937",
  fontWeight: "600",
  margin: "0",
};

const totalLabel = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#000",
  margin: "0",
};

const totalValue = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#1f2937",
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
};

const button = {
  backgroundColor: "#2563eb",
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
