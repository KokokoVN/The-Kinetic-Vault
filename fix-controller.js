const fs = require('fs');
const file = 'e:/e-commerce-microservices-master/e-commerce-microservices-master/order-service/src/main/java/com/rainbowforest/orderservice/controller/OrderController.java';
let content = fs.readFileSync(file, 'utf8');

const code = `
    @GetMapping(value = "/orders/export")
    public ResponseEntity<byte[]> exportOrders(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "paymentStatus", required = false) String paymentStatus,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) {
        try {
            byte[] pdfData = orderService.exportOrdersToPdf(status, paymentStatus, q, startDate, endDate);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Orders_Export.pdf");
            headers.add("Content-Type", "application/pdf");
            return new ResponseEntity<byte[]>(pdfData, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<byte[]>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = "/orders/{id}/invoice")
    public ResponseEntity<byte[]> exportOrderInvoice(@PathVariable("id") Long id) {
        try {
            Optional<Order> orderOpt = orderService.getOrderById(id);
            if (!orderOpt.isPresent()) {
                return new ResponseEntity<byte[]>(HttpStatus.NOT_FOUND);
            }
            byte[] pdfData = com.rainbowforest.orderservice.utilities.PdfOrderGenerator.generateInvoicePdf(orderOpt.get());
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=Invoice_" + id + ".pdf");
            headers.add("Content-Type", "application/pdf");
            return new ResponseEntity<byte[]>(pdfData, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<byte[]>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
`;

content = content.replace(/\s*}\s*$/, code);
fs.writeFileSync(file, content, 'utf8');
console.log('Appended methods cleanly.');
