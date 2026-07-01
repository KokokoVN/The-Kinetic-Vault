package com.rainbowforest.userservice.controller;

import com.rainbowforest.activitylog.ActivityLogPublisher;
import com.rainbowforest.userservice.activity.UserActivityLogSupport;
import com.rainbowforest.userservice.dto.UserAddressUpsertRequest;
import com.rainbowforest.userservice.dto.UserRoleUpdateRequest;
import com.rainbowforest.userservice.dto.UserStatsUpdateRequest;
import com.rainbowforest.userservice.entity.UserAddress;
import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserLoginDevice;
import com.rainbowforest.userservice.entity.UserProfileChangeLog;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.web.client.RestTemplate;
@RestController
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private ActivityLogPublisher activityLogPublisher;
    
    @GetMapping (value = "/users")
    public ResponseEntity<List<User>> getAllUsers(){
        List<User> users =  userService.getAllUsers();
        if(!users.isEmpty()) {
        	return new ResponseEntity<List<User>>(
        		users,
        		headerGenerator.getHeadersForSuccessGetMethod(),
        		HttpStatus.OK);
        }
        return new ResponseEntity<List<User>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/users", params = "name")
    public ResponseEntity<User> getUserByName(@RequestParam("name") String userName){
    	User user = userService.getUserByName(userName);
    	if(user != null) {
    		return new ResponseEntity<User>(
    				user,
    				headerGenerator.
    				getHeadersForSuccessGetMethod(),
    				HttpStatus.OK);
    	}
        return new ResponseEntity<User>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id){
        User user = userService.getUserById(id);
        if(user != null) {
    		return new ResponseEntity<User>(
    				user,
    				headerGenerator.
    				getHeadersForSuccessGetMethod(),
    				HttpStatus.OK);
    	}
        return new ResponseEntity<User>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/users/{id}/devices")
    public ResponseEntity<List<UserLoginDevice>> getUserLoginDevices(@PathVariable("id") Long id) {
        List<UserLoginDevice> devices = userService.getUserLoginDevices(id);
        return new ResponseEntity<List<UserLoginDevice>>(
                devices,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping(value = "/users/{id}/profile-changes")
    public ResponseEntity<List<UserProfileChangeLog>> getUserProfileChangeLogs(@PathVariable("id") Long id) {
        List<UserProfileChangeLog> changeLogs = userService.getUserProfileChangeLogs(id);
        return new ResponseEntity<List<UserProfileChangeLog>>(
                changeLogs,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @PostMapping (value = "/users")
    public ResponseEntity<User> addUser(@RequestBody User user, HttpServletRequest request){
    	if(user != null)
    		try {
    			userService.saveUser(user);
                activityLogPublisher.publish(
                        "user-service",
                        "USER_ADMIN_CREATE",
                        "User",
                        String.valueOf(user.getId()),
                        "POST",
                        "/users",
                        UserActivityLogSupport.detailAfterUser(user),
                        user.getUserName(),
                        null);
    			return new ResponseEntity<User>(
    					user,
    					headerGenerator.getHeadersForSuccessPostMethod(request, user.getId()),
    					HttpStatus.CREATED);
    		}catch (Exception e) {
    			e.printStackTrace();
    			return new ResponseEntity<User>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
    	return new ResponseEntity<User>(HttpStatus.BAD_REQUEST);
    }

    @PutMapping(value = {"/users/{id}/role", "/accounts/users/{id}/role"})
    public ResponseEntity<User> updateUserRole(
            @PathVariable("id") Long id,
            @RequestBody UserRoleUpdateRequest req
    ) {
        User updated = userService.updateUserRole(id, req);
        if (updated == null) {
            return new ResponseEntity<User>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
        activityLogPublisher.publish(
                "user-service",
                "USER_ROLE_UPDATE",
                "User",
                String.valueOf(updated.getId()),
                "PUT",
                "/users/" + id + "/role",
                UserActivityLogSupport.detailAfterUser(updated),
                req != null ? req.getPerformedBy() : null,
                String.valueOf(id));
        return new ResponseEntity<User>(
                updated,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @PutMapping(value = {"/users/{id}/stats", "/accounts/users/{id}/stats"})
    public ResponseEntity<User> updateUserStats(
            @PathVariable("id") Long id,
            @RequestBody UserStatsUpdateRequest req
    ) {
        User updated = userService.updateUserStats(id, req);
        if (updated == null) {
            return new ResponseEntity<User>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
        return new ResponseEntity<User>(
                updated,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @PutMapping(value = {"/users/{id}/stats/exact", "/accounts/users/{id}/stats/exact"})
    public ResponseEntity<User> setExactUserStats(
            @PathVariable("id") Long id,
            @RequestBody UserStatsUpdateRequest req
    ) {
        User updated = userService.setExactUserStats(id, req);
        if (updated == null) {
            return new ResponseEntity<User>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
        return new ResponseEntity<User>(
                updated,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @PutMapping(value = "/users/{id}/unlock")
    public ResponseEntity<java.util.Map<String, String>> unlockUser(@PathVariable("id") Long id) {
        boolean unlocked = userService.unlockUser(id);
        if (unlocked) {
            activityLogPublisher.publish(
                    "user-service",
                    "USER_UNLOCK",
                    "User",
                    String.valueOf(id),
                    "PUT",
                    "/users/" + id + "/unlock",
                    java.util.Collections.singletonMap("action", "Mở khóa tài khoản người dùng thành công"),
                    null,
                    String.valueOf(id));
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "Mở khóa tài khoản thành công");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @GetMapping(value = "/users/{id}/addresses")
    public ResponseEntity<List<UserAddress>> listUserAddresses(@PathVariable("id") Long id) {
        List<UserAddress> rows = userService.listUserAddresses(id);
        return new ResponseEntity<List<UserAddress>>(
                rows,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping(value = "/users/{id}/address")
    public ResponseEntity<UserAddress> getDefaultUserAddress(@PathVariable("id") Long id) {
        UserAddress row = userService.getUserAddress(id);
        if (row == null) {
            return new ResponseEntity<UserAddress>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<UserAddress>(
                row,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @PostMapping(value = "/users/{id}/addresses")
    public ResponseEntity<UserAddress> createUserAddress(
            @PathVariable("id") Long id,
            @RequestBody UserAddressUpsertRequest req,
            HttpServletRequest request
    ) {
        UserAddress created = userService.createUserAddress(id, req);
        if (created == null) {
            return new ResponseEntity<UserAddress>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        }
        activityLogPublisher.publish(
                "user-service",
                "USER_ADDRESS_CREATE",
                "UserAddress",
                String.valueOf(created.getId()),
                "POST",
                "/users/" + id + "/addresses",
                UserActivityLogSupport.detailAfterAddress(id, created),
                null,
                String.valueOf(id));
        return new ResponseEntity<UserAddress>(
                created,
                headerGenerator.getHeadersForSuccessPostMethod(request, created.getId()),
                HttpStatus.CREATED);
    }

    @PutMapping(value = "/users/{id}/addresses/{addressId}")
    public ResponseEntity<UserAddress> updateUserAddress(
            @PathVariable("id") Long id,
            @PathVariable("addressId") Long addressId,
            @RequestBody UserAddressUpsertRequest req,
            HttpServletRequest request
    ) {
        UserAddress row = userService.updateUserAddress(id, addressId, req);
        if (row == null) {
            return new ResponseEntity<UserAddress>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        }
        activityLogPublisher.publish(
                "user-service",
                "USER_ADDRESS_UPDATE",
                "UserAddress",
                String.valueOf(row.getId()),
                "PUT",
                "/users/" + id + "/addresses/" + addressId,
                UserActivityLogSupport.detailAfterAddress(id, row),
                null,
                String.valueOf(id));
        return new ResponseEntity<UserAddress>(
                row,
                headerGenerator.getHeadersForSuccessPostMethod(request, row.getId()),
                HttpStatus.OK);
    }

    @DeleteMapping(value = "/users/{id}/addresses/{addressId}")
    public ResponseEntity<Void> deleteUserAddress(@PathVariable("id") Long id, @PathVariable("addressId") Long addressId) {
        boolean deleted = userService.deleteUserAddress(id, addressId);
        if (deleted) {
            activityLogPublisher.publish(
                    "user-service",
                    "USER_ADDRESS_DELETE",
                    "UserAddress",
                    String.valueOf(addressId),
                    "DELETE",
                    "/users/" + id + "/addresses/" + addressId,
                    UserActivityLogSupport.detailBeforeAddressDelete(id, addressId),
                    null,
                    String.valueOf(id));
            return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<Void>(HttpStatus.NOT_FOUND);
    }

    @PatchMapping(value = "/users/{id}/addresses/{addressId}/default")
    public ResponseEntity<UserAddress> setUserAddressDefault(@PathVariable("id") Long id, @PathVariable("addressId") Long addressId) {
        UserAddress row = userService.setUserAddressDefault(id, addressId);
        if (row == null) {
            return new ResponseEntity<UserAddress>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        }
        activityLogPublisher.publish(
                "user-service",
                "USER_ADDRESS_SET_DEFAULT",
                "UserAddress",
                String.valueOf(row.getId()),
                "PATCH",
                "/users/" + id + "/addresses/" + addressId + "/default",
                UserActivityLogSupport.detailAfterAddress(id, row),
                null,
                String.valueOf(id));
        return new ResponseEntity<UserAddress>(
                row,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    // Backward-compatible endpoint for legacy frontend.
    @PostMapping(value = "/users/{id}/address")
    public ResponseEntity<UserAddress> createUserAddressLegacy(
            @PathVariable("id") Long id,
            @RequestBody UserAddressUpsertRequest req,
            HttpServletRequest request
    ) {
        return createUserAddress(id, req, request);
    }

    private List<Object> cachedProvinces = null;
    private final java.util.Map<String, List<Object>> cachedWards = new java.util.concurrent.ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping(value = {"/addresses/vn/provinces", "/accounts/addresses/vn/provinces"})
    public ResponseEntity<List<Object>> getVnProvinces() {
        if (cachedProvinces == null) {
            try {
                List<Object> list = restTemplate.getForObject("https://provinces.open-api.vn/api/v2/p/", List.class);
                if (list != null) {
                    cachedProvinces = list;
                }
            } catch (Exception e) {
                return new ResponseEntity<>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.SERVICE_UNAVAILABLE
                );
            }
        }
        return new ResponseEntity<>(
                cachedProvinces,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }

    @GetMapping(value = {"/addresses/vn/provinces/{provinceCode}/wards", "/accounts/addresses/vn/provinces/{provinceCode}/wards"})
    public ResponseEntity<List<Object>> getVnWards(@PathVariable("provinceCode") String provinceCode) {
        if (provinceCode == null || provinceCode.trim().isEmpty()) {
            return new ResponseEntity<>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST
            );
        }
        String key = provinceCode.trim();
        if (!cachedWards.containsKey(key)) {
            try {
                java.util.Map<String, Object> details = restTemplate.getForObject("https://provinces.open-api.vn/api/v2/p/" + key + "?depth=2", java.util.Map.class);
                if (details != null && details.containsKey("wards")) {
                    List<Object> wardsList = (List<Object>) details.get("wards");
                    if (wardsList != null) {
                        cachedWards.put(key, wardsList);
                    }
                }
            } catch (Exception e) {
                return new ResponseEntity<>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.SERVICE_UNAVAILABLE
                );
            }
        }
        List<Object> result = cachedWards.get(key);
        if (result == null) {
            return new ResponseEntity<>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND
            );
        }
        return new ResponseEntity<>(
                result,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK
        );
    }
}
