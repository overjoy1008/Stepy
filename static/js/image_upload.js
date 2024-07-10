// const chattingScreen = document.getElementById('chattingScreen');

// const modalOverlay1 = document.getElementById('modalOverlay1');
// const modalOverlay2 = document.getElementById('modalOverlay2');
// const modalOverlay3 = document.getElementById('modalOverlay3');
// const chatContainer = document.getElementById('chatContainer');

// const chatInput = document.getElementById('chat-input');
// const sendButton = document.getElementById('sendButton');
// const sendButtonImage = sendButton.querySelector('img');

// const moreButton = document.querySelector('.more-button');
// const imageUploadOverlay = document.getElementById('imageUploadOverlay');
// const imageUploadModal = document.getElementById('imageUploadModal');
// const takePhotoButton = document.getElementById('takePhotoButton');
// const uploadImageButton = document.getElementById('uploadImageButton');
// const imageInput = document.getElementById('imageInput');
// const imagePreviewContainer = document.getElementById('imagePreviewContainer');
// const imagePreview = document.getElementById('imagePreview');
// const confirmImageButton = document.getElementById('confirmImageButton');
// const cancelImageButton = document.getElementById('cancelImageButton');


// const modalOverlayCarousel = document.getElementById('modalOverlayCarousel');
// const carouselButtons = document.querySelectorAll('.carousel-button');

moreButton.addEventListener('click', function(event) {
    console.log('More button clicked');
    event.stopPropagation();
    imageUploadOverlay.style.display = 'block';
});

imageUploadOverlay.addEventListener('click', function(event) {
    if (event.target === imageUploadOverlay) {
        imageUploadOverlay.style.display = 'none';
    }
});

takePhotoButton.addEventListener('click', function() {
    isImageCapture = true;
    imageInput.setAttribute('capture', 'environment');
    imageInput.setAttribute('accept', 'image/*');
    imageInput.click();
});

uploadImageButton.addEventListener('click', function() {
    isImageCapture = false;
    imageInput.removeAttribute('capture');
    imageInput.setAttribute('accept', 'image/*');
    // imageInput.accept = "image/*";
    imageInput.click();
});

imageInput.addEventListener('change', function(event) {
    console.log('Image selected');
    event.stopPropagation();
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            base64ImageData = e.target.result.split(',')[1]; // base64 데이터 저장
            console.log('Image base64 data:', base64ImageData);
            showImagePreview();
        };
        reader.readAsDataURL(file);
    }
});

function showImagePreview() {
    imagePreviewContainer.style.display = 'flex';
    imageUploadOverlay.style.display = 'none';
}

confirmImageButton.addEventListener('click', function() {
    // console.log('Image uploaded:', imagePreview);
    const imageUrl = imagePreview.src;
    addImageMessage(imageUrl, true);
    imagePreviewContainer.style.display = 'none';
    imageInput.value = '';
    modalOverlayCarousel.style.display = 'flex';
    isCarouselFromImageUpload = true;
});

cancelImageButton.addEventListener('click', function() {
    imagePreviewContainer.style.display = 'none';
    imageInput.click();
});

function addImageMessage(imageUrl, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'ai-message');
    
    const imageElement = document.createElement('img');
    imageElement.src = imageUrl;
    imageElement.classList.add('uploaded-image');
    
    messageElement.appendChild(imageElement);
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}