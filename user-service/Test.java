import org.springframework.http.MediaType;
public class Test {
    public static void main(String[] args) {
        MediaType m = MediaType.valueOf("application/json;charset=UTF-8");
        System.out.println(m);
    }
}
