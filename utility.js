const dbPromise = idb.open('texts-store', 1, (db) => {
  !db.objectStoreNames.contains('texts') &&
    db.createObjectStore('texts', {
      keyPath: 'id',
    });
});

const writeDataIDB = (dbName, data) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(dbName, 'readwrite');
    const store = tx.objectStore(dbName);
    store.put(data);
    return tx.complete;
  });
};

const readDataIDB = (dbName) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(dbName, 'readonly');
    const store = tx.objectStore(dbName);
    return store.getAll();
  });
};

const clearDataIDB = (dbName) => {
  return dbPromise.then(() => {
    const tx = db.transaction(dbName, 'readwrite');
    const store = tx.objectStore(dbName);
    store.clear();
    return tx.complete;
  });
};
