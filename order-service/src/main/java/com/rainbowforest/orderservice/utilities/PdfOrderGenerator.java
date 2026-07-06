package com.rainbowforest.orderservice.utilities;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.util.List;

public class PdfOrderGenerator {

    public static byte[] generateOrderListPdf(List<Order> orders) throws Exception {
        Document document = new Document(PageSize.A4.rotate(), 15, 15, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Paragraph title = new Paragraph("DANH SACH DON HANG", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        PdfPTable table = new PdfPTable(9);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1f, 2f, 2f, 2f, 2f, 2f, 2f, 2f, 3f});

        Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        String[] headers = {"ID", "Ma Van Don", "Khach Hang", "Phone", "Tong", "Trang Thai", "Thanh Toan", "Ngay", "Dia Chi"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            table.addCell(cell);
        }

        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        for (Order order : orders) {
            table.addCell(new Phrase(order.getId() != null ? String.valueOf(order.getId()) : "", bodyFont));
            table.addCell(new Phrase(order.getOrderNumber() != null ? order.getOrderNumber() : "", bodyFont));
            table.addCell(new Phrase(order.getUserName() != null ? order.getUserName() : "", bodyFont));
            table.addCell(new Phrase(order.getPhoneLast4() != null ? "****" + order.getPhoneLast4() : "", bodyFont));
            table.addCell(new Phrase(order.getTotal() != null ? String.valueOf(order.getTotal()) : "0", bodyFont));
            table.addCell(new Phrase(order.getStatus() != null ? order.getStatus() : "", bodyFont));
            table.addCell(new Phrase(order.getPaymentStatus() != null ? order.getPaymentStatus() : "", bodyFont));
            table.addCell(new Phrase(order.getOrderedDate() != null ? order.getOrderedDate().toString() : "", bodyFont));
            table.addCell(new Phrase(order.getShippingAddress() != null ? order.getShippingAddress() : "", bodyFont));
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    public static byte[] generateInvoicePdf(Order order) throws Exception {
        Document document = new Document(PageSize.A5, 20, 20, 30, 30);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("HOA DON BAN HANG", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

        document.add(new Paragraph("Ma don hang: " + (order.getOrderNumber() != null ? order.getOrderNumber() : order.getId()), boldFont));
        document.add(new Paragraph("Ma van don: " + (order.getMvd() != null && !order.getMvd().trim().isEmpty() ? order.getMvd() : "Chua co"), boldFont));
        document.add(new Paragraph("Ngay dat: " + order.getOrderedDate(), normalFont));
        document.add(new Paragraph("Trang thai don: " + (order.getStatus() != null ? order.getStatus() : ""), normalFont));
        document.add(new Paragraph("Thanh toan: " + (order.getPaymentStatus() != null ? order.getPaymentStatus() : "") 
            + " (" + (order.getPaymentMethod() != null ? order.getPaymentMethod() : "") + ")", normalFont));
        document.add(new Paragraph("Khach hang: " + (order.getUserName() != null ? order.getUserName() : ""), normalFont));
        document.add(new Paragraph("So dien thoai: " + (order.getPhoneLast4() != null ? "****" + order.getPhoneLast4() : ""), normalFont));
        document.add(new Paragraph("Dia chi giao: " + order.getShippingAddress(), normalFont));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3f, 1f, 2f});
        
        PdfPCell c1 = new PdfPCell(new Phrase("San pham", boldFont));
        c1.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(c1);
        PdfPCell c2 = new PdfPCell(new Phrase("SL", boldFont));
        c2.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(c2);
        PdfPCell c3 = new PdfPCell(new Phrase("Thanh tien", boldFont));
        c3.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(c3);

        if (order.getItems() != null) {
            for (Item item : order.getItems()) {
                String productName = item.getProduct() != null ? item.getProduct().getProductName() : "SP " + item.getProductId();
                if (item.getVariantLabel() != null && !item.getVariantLabel().isEmpty()) {
                    productName += " (" + item.getVariantLabel() + ")";
                }
                table.addCell(new Phrase(productName, normalFont));
                table.addCell(new Phrase(String.valueOf(item.getQuantity()), normalFont));
                table.addCell(new Phrase(item.getSubTotal() != null ? String.valueOf(item.getSubTotal()) : "0", normalFont));
            }
        }
        document.add(table);
        
        document.add(new Paragraph(" "));
        Paragraph total = new Paragraph("Tong tien: " + (order.getTotal() != null ? String.valueOf(order.getTotal()) : "0") + " VND", boldFont);
        total.setAlignment(Element.ALIGN_RIGHT);
        document.add(total);

        document.close();
        return out.toByteArray();
    }
}
