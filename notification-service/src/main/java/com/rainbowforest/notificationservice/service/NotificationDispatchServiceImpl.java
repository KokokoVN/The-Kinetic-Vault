package com.rainbowforest.notificationservice.service;

import com.rainbowforest.notificationservice.dto.SendNotificationRequest;
import com.rainbowforest.notificationservice.entity.NotificationMessage;
import com.rainbowforest.notificationservice.repository.NotificationMessageRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.mail.internet.MimeMessage;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationDispatchServiceImpl implements NotificationDispatchService {

    private static final Logger log = LoggerFactory.getLogger(NotificationDispatchServiceImpl.class);

    private final NotificationMessageRepository repository;
    private final JavaMailSender mailSender;

    @Value("${app.mail.from-name:The Kinetic Vault}")
    private String fromName;

    @Value("${app.mail.from-email:}")
    private String fromEmail;

    @Value("${app.sms.provider-url:}")
    private String smsProviderUrl;

    @Value("${app.sms.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${app.sms.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${app.sms.twilio.from-phone:}")
    private String twilioFromNumber;

    public NotificationDispatchServiceImpl(NotificationMessageRepository repository, JavaMailSender mailSender) {
        this.repository = repository;
        this.mailSender = mailSender;
    }

    @Override
    public NotificationMessage send(SendNotificationRequest request) {
        NotificationMessage msg = new NotificationMessage();
        String channel = request.getChannel() != null ? request.getChannel().trim().toUpperCase() : "UNKNOWN";
        msg.setChannel(channel);
        msg.setRecipient(request.getRecipient());
        msg.setSubject(request.getSubject());
        msg.setBody(request.getBody());
        msg.setStatus("UNREAD");
        msg.setSource(("WEB".equals(channel) || "BOTH".equals(channel)) ? "WEB" : "ADMIN");

        try {
            if ("EMAIL".equals(channel) || "BOTH".equals(channel)) {
                boolean isHtml = request.getHtml() != null && request.getHtml();
                sendEmail(msg.getRecipient(), msg.getSubject(), msg.getBody(), isHtml);
            }
            if ("SMS".equals(channel) || "OTP_SMS".equals(channel)) {
                sendSms(msg.getRecipient(), msg.getBody(), msg.getSubject());
            }
            if ("WEB".equals(channel) || "BOTH".equals(channel)) {
                log.info("[notification-web] channel={} to={} subject={}", msg.getChannel(), msg.getRecipient(), msg.getSubject());
            }
            if (!"EMAIL".equals(channel) && !"WEB".equals(channel) && !"BOTH".equals(channel)
                    && !"SMS".equals(channel) && !"OTP_SMS".equals(channel)) {
                log.info("[notification-mock] channel={} to={} subject={}", msg.getChannel(), msg.getRecipient(), msg.getSubject());
            }
            msg.setStatus("SENT");
        } catch (Exception e) {
            msg.setStatus("FAILED");
            log.warn("[notification-send-failed] channel={} to={} subject={} err={}",
                    msg.getChannel(), msg.getRecipient(), msg.getSubject(), e.toString());
        }

        return repository.save(msg);
    }

    private void sendSms(String to, String body, String subject) throws Exception {
        if (to == null || to.trim().isEmpty()) {
            log.warn("[notification-sms] skip empty recipient");
            return;
        }
        String cleanTo = to.trim();
        if (smsProviderUrl != null && !smsProviderUrl.trim().isEmpty()) {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/json;charset=UTF-8"));
            String payload = "{" +
                    "\"recipient\":\"" + escapeJson(cleanTo) + "\"," +
                    "\"subject\":\"" + escapeJson(subject != null ? subject : "OTP") + "\"," +
                    "\"message\":\"" + escapeJson(body != null ? body : "") + "\"" +
                    "}";
            restTemplate.postForEntity(smsProviderUrl.trim(), new HttpEntity<String>(payload, headers), String.class);
            log.info("[notification-sms] to={} subject={} via HTTP", cleanTo, subject);
            return;
        }
        if (twilioAccountSid != null && !twilioAccountSid.trim().isEmpty()
                && twilioAuthToken != null && !twilioAuthToken.trim().isEmpty()
                && twilioFromNumber != null && !twilioFromNumber.trim().isEmpty()) {
            String twilioTo = normalizePhoneForTwilio(cleanTo);
            String twilioFrom = normalizePhoneForTwilio(twilioFromNumber.trim());
            Twilio.init(twilioAccountSid.trim(), twilioAuthToken.trim());
            Message.creator(
                    new PhoneNumber(twilioTo),
                    new PhoneNumber(twilioFrom),
                    body != null ? body : "")
                    .create();
            log.info("[notification-sms] to={} subject={} via Twilio", twilioTo, subject);
            return;
        }
        log.info("[notification-sms-mock] to={} subject={}", cleanTo, subject);
    }

    private String normalizePhoneForTwilio(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) return null;
        if (digits.startsWith("0") && digits.length() == 10) {
            return "+84" + digits.substring(1);
        }
        if (digits.startsWith("84") && digits.length() == 11) {
            return "+" + digits;
        }
        if (raw.startsWith("+84") && digits.length() == 11) {
            return raw;
        }
        return raw;
    }

    private String applyEmailTemplate(String subject, String content, boolean isHtmlInput) {
        String safeContent = content;
        if (!isHtmlInput) {
            safeContent = content.replace("\n", "<br/>");
        }
        
        StringBuilder html = new StringBuilder();
        html.append("<div style=\"margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">");
        html.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#f1f5f9; background-image:radial-gradient(circle at top right,#e0e7ff,#f1f5f9); padding:40px 16px;\"><tr><td align=\"center\">");
        html.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"600\" style=\"max-width:600px;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 40px -10px rgba(0,0,0,0.08);border:1px solid #e2e8f0;text-align:left;\">");
        
        // Header (Royal Gradient)
        html.append("<tr><td style=\"background:linear-gradient(135deg, #0f172a 0%, #312e81 50%, #4f46e5 100%);padding:48px 40px;color:#ffffff;text-align:center;\">");
        html.append("<div style=\"display:inline-block;padding:6px 16px;background:rgba(255,255,255,0.1);border-radius:20px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;font-size:11px;margin-bottom:20px;\">Thông Báo Hệ Thống</div>");
        html.append("<div style=\"font-size:32px;font-weight:900;line-height:1.2;margin:0;\">").append(subject != null ? subject : "Thông Báo").append("</div>");
        html.append("</td></tr>");
        
        // Neon Divider
        html.append("<tr><td style=\"padding:0;background:#ffffff;\">");
        html.append("<div style=\"height:4px;width:100%;background:linear-gradient(90deg, #38bdf8, #818cf8, #c084fc);\"></div>");
        html.append("</td></tr>");
        
        // Body Content
        html.append("<tr><td style=\"padding:48px 40px;color:#334155;font-size:16px;line-height:1.7;\">");
        html.append(safeContent);
        // Signature Line
        html.append("<div style=\"margin-top: 40px; padding-top: 32px; border-top: 1px dashed #cbd5e1;\">");
        html.append("<p style=\"margin: 0; font-size: 14px; color: #64748b;\">Trân trọng,<br><strong style=\"color:#0f172a;\">Ban Quản Trị The Kinetic Vault</strong></p>");
        html.append("</div>");
        html.append("</td></tr>");
        
        // Footer
        html.append("<tr><td style=\"padding:32px 40px;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.6;text-align:center;\">");
        html.append("<div style=\"font-weight:800;font-size:14px;color:#0f172a;margin-bottom:8px;letter-spacing:0.05em;\">THE KINETIC VAULT</div>");
        html.append("© ").append(java.time.Year.now().getValue()).append(" The Kinetic Vault. All rights reserved.<br>Email này được tạo tự động từ hệ thống. Vui lòng không trả lời.");
        html.append("</td></tr>");
        
        html.append("</table>");
        
        // Bottom Spacing
        html.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"><tr><td height=\"40\"></td></tr></table>");
        html.append("</td></tr></table></div>");
        
        return html.toString();
    }

    private void sendEmail(String to, String subject, String body, boolean html) throws Exception {
        String finalBody = body != null ? body : "";
        boolean isFinalHtml = html;

        // Tự động bọc template giao diện cao cấp nếu email chưa được format (không có background:#f8fafc)
        if (!finalBody.contains("background:#f8fafc")) {
            finalBody = applyEmailTemplate(subject, finalBody, html);
            isFinalHtml = true;
        }

        if (isFinalHtml) {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject != null ? subject : "(no subject)");
            helper.setText(finalBody, true);
            String from = (fromEmail != null && !fromEmail.trim().isEmpty()) ? fromEmail.trim() : null;
            if (from != null) {
                if (fromName != null && !fromName.trim().isEmpty()) {
                    helper.setFrom(from, fromName.trim());
                } else {
                    helper.setFrom(from);
                }
            }
            mailSender.send(mime);
            log.info("[notification-email-html] to={} subject={}", to, subject);
            return;
        }
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(to);
        mail.setSubject(subject != null ? subject : "(no subject)");
        mail.setText(finalBody);
        String from = (fromEmail != null && !fromEmail.trim().isEmpty()) ? fromEmail.trim() : null;
        if (from != null) {
            mail.setFrom(from);
        }
        mailSender.send(mail);
        log.info("[notification-email] to={} subject={}", to, subject);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<NotificationMessage> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationMessage> findByRecipient(String recipient) {
        return repository.findByRecipientOrderByCreatedAtDesc(recipient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationMessage> findWebNotificationsByRecipient(String recipient) {
        return repository.findByRecipientAndChannelInOrderByCreatedAtDesc(recipient, java.util.Arrays.asList("WEB", "BOTH"));
    }

    @Override
    public NotificationMessage save(NotificationMessage message) {
        return repository.save(message);
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
