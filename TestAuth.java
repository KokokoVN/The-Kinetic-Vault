import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.CodeGenerator;

public class TestAuth {
    public static void main(String[] args) throws Exception {
        CodeGenerator codeGen = new DefaultCodeGenerator();
        String secret = "UPBX653UGGFTDY3VPGXHT425IVY5XZ2C";
        long currentT = System.currentTimeMillis() / 1000;
        
        for (long t = currentT - 86400*30; t < currentT + 86400; t += 30) {
            if (codeGen.generate(secret, t / 30).equals("931093")) {
                System.out.println("Match found at time: " + t);
            }
        }
        System.out.println("Done brute-force.");
    }
}
