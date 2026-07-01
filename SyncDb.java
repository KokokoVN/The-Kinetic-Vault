import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

public class SyncDb {
    public static void main(String[] args) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection orderConn = DriverManager.getConnection("jdbc:mysql://localhost:3306/orders?useSSL=false&allowPublicKeyRetrieval=true", "root", "");
            System.out.println("Connected to orders DB.");
            PreparedStatement ps = orderConn.prepareStatement("SELECT user_id, SUM(total), COUNT(*) FROM orders WHERE status = 'DELIVERED' GROUP BY user_id");
            ResultSet rs = ps.executeQuery();
            Map<Long, Double> totals = new HashMap<>();
            Map<Long, Long> counts = new HashMap<>();
            while (rs.next()) {
                long uid = rs.getLong(1);
                double total = rs.getDouble(2);
                long count = rs.getLong(3);
                totals.put(uid, total);
                counts.put(uid, count);
            }
            rs.close();
            ps.close();
            orderConn.close();

            Connection userConn = DriverManager.getConnection("jdbc:mysql://localhost:3306/users?useSSL=false&allowPublicKeyRetrieval=true", "root", "");
            System.out.println("Connected to users DB.");
            PreparedStatement updatePs = userConn.prepareStatement("UPDATE user SET total_spent = ?, completed_orders_count = ? WHERE id = ?");
            for (Long uid : totals.keySet()) {
                updatePs.setDouble(1, totals.get(uid));
                updatePs.setLong(2, counts.get(uid));
                updatePs.setLong(3, uid);
                updatePs.executeUpdate();
                System.out.println("Updated user " + uid + " with total " + totals.get(uid) + " and count " + counts.get(uid));
            }
            updatePs.close();
            userConn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
