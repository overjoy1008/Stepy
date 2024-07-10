import { addMessage, transitionToNextModal, base64ImageData } from '/static/js/chatting_screen.js';
import { finding_llm_respomse } from '/static/js/analyze_problem.js';

const carouselButtons = document.querySelectorAll('.carousel-button');

carouselButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (isCarouselFromImageUpload) {
            selectedTopic = this.dataset.topic;
            modalOverlayCarousel.style.display = 'none';
            console.log('Selected topic:', selectedTopic);
            addMessage(`선택한 주제는 ${selectedTopic}입니다. 어떤 도움이 필요하신가요?`, false);
            isCarouselFromImageUpload = false; // Reset the flag

            const formData = new URLSearchParams();
            formData.append('topic', selectedTopic);
            finding_llm_respomse(base64ImageData); // 버튼을 누르자마자 ChatGPT의 문제 분석 시작하기
        
        } else if (currentModal === 2) {
            transitionToNextModal(modalOverlay2, modalOverlay3);
            currentModal = 3;
        }
    });
});