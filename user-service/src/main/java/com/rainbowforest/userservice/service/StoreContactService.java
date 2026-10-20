package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.dto.StoreContactUpsertRequest;
import com.rainbowforest.userservice.entity.StoreContact;

import java.util.List;

public interface StoreContactService {
    StoreContact getPrimaryStoreContact();
    List<StoreContact> getAllActiveStoreContacts();
    StoreContact getStoreContactById(Long id);
    StoreContact saveOrUpdateStoreContact(StoreContactUpsertRequest request, String actor);
    void deleteStoreContact(Long id, String actor);
}
