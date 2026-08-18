package com.jinx.arsenaltracker;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            Resend resend = new Resend(resendApiKey);

            String resetLink = "https://gunners-tracker.netlify.app/reset-password?token=" + resetToken;

            String htmlBody = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #9b0005; padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0;">⚽ Arsenal Tracker</h1>
                        </div>
                        <div style="padding: 30px; background-color: #1a1a1a; color: #ffffff;">
                            <h2>Password Reset Request</h2>
                            <p>You requested a password reset for your Arsenal Tracker account.</p>
                            <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s"
                                   style="background-color: #db0007; color: white; padding: 14px 28px;
                                          text-decoration: none; border-radius: 4px; font-size: 16px;">
                                    Reset Password
                                </a>
                            </div>
                            <p style="color: #aaaaaa; font-size: 0.85rem;">
                                If you didn't request this, ignore this email — your password won't change.
                            </p>
                            <p style="color: #aaaaaa; font-size: 0.85rem;">
                                Or copy this link: %s
                            </p>
                        </div>
                    </div>
                    """.formatted(resetLink, resetLink);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from("Arsenal Tracker <onboarding@resend.dev>")
                    .to(toEmail)
                    .subject("Reset your Arsenal Tracker password")
                    .html(htmlBody)
                    .build();

            resend.emails().send(params);
            System.out.println("Password reset email sent to: " + toEmail);

        } catch (ResendException e) {
            System.err.println("Failed to send email: " + e.getMessage());
            throw new RuntimeException("Failed to send reset email");
        }
    }
}