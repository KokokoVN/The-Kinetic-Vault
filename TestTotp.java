import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;

public class TestTotp {
    public static void main(String[] args) throws Exception {
        SecretGenerator generator = new DefaultSecretGenerator();
        String secret = generator.generate();
        System.out.println("Secret: " + secret);
        
        dev.samstevens.totp.code.CodeGenerator codeGen = new DefaultCodeGenerator();
        long currentBucket = (System.currentTimeMillis() / 1000) / 30;
        String code = codeGen.generate(secret, currentBucket);
        System.out.println("Code: " + code);
        
        TimeProvider timeProvider = new SystemTimeProvider();
        DefaultCodeVerifier verifier = new DefaultCodeVerifier(codeGen, timeProvider);
        System.out.println("Valid: " + verifier.isValidCode(secret, code));
    }
}
