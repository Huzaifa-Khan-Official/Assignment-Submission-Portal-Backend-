const downloadImageUrl = (file) => {
    return new Promise((resolve, reject) => {
        const restaurantImageRef = ref(
            storage,
            // storage location
            `restaurantImages/${adminUid}/${file.name}`
        );
        const uploadTask = uploadBytesResumable(restaurantImageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                switch (snapshot.state) {
                    case "paused":
                        break;
                    case "running":
                        spinnerBorder.style.display = "block";
                        break;
                }
            },
            (error) => {
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref)
                    .then((downloadURL) => {
                        resolve(downloadURL);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        );
    });
};

export default downloadImageUrl;