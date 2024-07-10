window.addEventListener('load', function () {
    const chattingScreen = document.getElementById('chattingScreen');

    const modalOverlay1 = document.getElementById('modalOverlay1');
    const modalOverlay2 = document.getElementById('modalOverlay2');
    const modalOverlay3 = document.getElementById('modalOverlay3');
    const chatContainer = document.getElementById('chatContainer');

    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('sendButton');
    const sendButtonImage = sendButton.querySelector('img');

    const moreButton = document.querySelector('.more-button');
    const imageUploadOverlay = document.getElementById('imageUploadOverlay');
    const imageUploadModal = document.getElementById('imageUploadModal');
    const takePhotoButton = document.getElementById('takePhotoButton');
    const uploadImageButton = document.getElementById('uploadImageButton');
    const imageInput = document.getElementById('imageInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const confirmImageButton = document.getElementById('confirmImageButton');
    const cancelImageButton = document.getElementById('cancelImageButton');


    const modalOverlayCarousel = document.getElementById('modalOverlayCarousel');
    const carouselButtons = document.querySelectorAll('.carousel-button');

    let currentModal = 1;
    let isTransitioning = false;
    let isWaitingForResponse = false;
    let isImageCapture = false;
    let selectedTopic = '';
    let isCarouselFromImageUpload = false;
    let base64ImageData = '';
    let chat_history = '';

    disableChatInputAndMoreButton();

    setTimeout(function () {
        modalOverlay1.style.opacity = '1';
    }, 1000);

    chattingScreen.addEventListener('click', function (event) {
        if (!isTransitioning) {
            isTransitioning = true;
            if (currentModal === 1) {
                transitionToNextModal(modalOverlay1, modalOverlay2);
                currentModal = 2;
            }
        }
        event.stopPropagation();
    });

    modalOverlay2.addEventListener('click', function (event) {
        if (!isTransitioning && currentModal === 2) {
            isTransitioning = true;
            transitionToNextModal(modalOverlay2, modalOverlay3);
            currentModal = 3;
        }
        event.stopPropagation();
    });

    modalOverlay3.addEventListener('click', function (event) {
        if (!isTransitioning && currentModal === 3) {
            isTransitioning = true;
            hideAllModals();
            currentModal = 0;
        }
        event.stopPropagation();
    });

    function transitionToNextModal(currentOverlay, nextOverlay) {
        currentOverlay.style.opacity = '0';
        setTimeout(function () {
            currentOverlay.style.display = 'none';
            nextOverlay.style.display = 'flex';
            nextOverlay.style.pointerEvents = 'auto';
            setTimeout(function () {
                nextOverlay.style.opacity = '1';
                isTransitioning = false;
            }, 50);
        }, 300);
    }

    function hideAllModals() {
        [modalOverlay1, modalOverlay2, modalOverlay3].forEach(overlay => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        });
        isTransitioning = false;
        enableChatInputAndMoreButton();
    }

    //------------| Chatting Status |------------//
    
    function disableChatInputAndMoreButton() {
        chatInput.disabled = true;
        moreButton.style.pointerEvents = 'none';
    }

    function enableChatInputAndMoreButton() {
        chatInput.disabled = false;
        moreButton.style.pointerEvents = 'auto';
    }

    function addMessage(message, isUser) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'ai-message');
        messageElement.textContent = message;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function disableSendButton() {
        sendButton.disabled = true;
        sendButton.style.backgroundColor = '#EBEBEB';
        sendButton.style.pointerEvents = 'none';
        sendButtonImage.src = '../static/img/sending_button_off.png';
    }

    function enableSendButton() {
        sendButton.disabled = false;
        sendButton.style.backgroundColor = '#3182F6';
        sendButton.style.pointerEvents = 'auto';
        sendButtonImage.src = '../static/img/sending_button.png';
    }

    function updateSendButtonState() {
        if (chatInput.value.trim() === '' || isWaitingForResponse) {
            disableSendButton();
        } else {
            enableSendButton();
        }
    }

    //------------| Sending & Receiving Chat |------------//

    async function sendMessage() {
        if (isWaitingForResponse || chatInput.value.trim() === '') return;
        const message = chatInput.value.trim();
        console.log('Sending message:', message);
        addMessage(message, true);
        chatInput.value = '';
        isWaitingForResponse = true;
        updateSendButtonState();
    
        try {
            const formData = new URLSearchParams();

            if (base64ImageData) {
                if (chat_history.length === 0) {
                    console.log("chat_history.length: ", chat_history.length);
                    addMessage("문제를 빠르게 분석하고 있어! 잠시만 30초 정도만 기다려줘~!", false);
                    return;
                } else {
                    chat_history.push(message);
                    console.log("chat_history.length: ", chat_history.length);
                    
                }
                console.log('Sending image data');
                formData.append('base64_image', base64ImageData);
            } else {
                console.log('No image data to send');
                formData.append('base64_image', '');  // 이미지가 없을 경우 빈 문자열을 보냄
            }

            formData.append('chat_history', chat_history);
    
            const response = await fetch('/get-chatgpt-response/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });
    
            const result = await response.json();
            const gpt_message = result.response;
            console.log('Received ChatGPT response:', gpt_message);
            addMessage(gpt_message, false);
        } catch (error) {
            console.error('Error fetching ChatGPT response:', error);
            addMessage('Error fetching response. Please try again.', false);
        } finally {
            isWaitingForResponse = false;
            updateSendButtonState();
        }
    }
    
    
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !isWaitingForResponse && chatInput.value.trim() !== '') {
            sendMessage();
        }
    });

    chatInput.addEventListener('input', updateSendButtonState);

    chatInput.addEventListener('focus', function () {
        // Ensure the chat container scrolls to the bottom when the keyboard appears
        setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
    });

    //------------| Image Upload |------------//

    // Prevent default touch behavior to ensure smooth transitions
    document.body.addEventListener('touchstart', function (e) {
        if (e.target === modalOverlay3) {
            e.preventDefault();
        }
    }, { passive: false });

    // Prevent clicks on modalOverlay2 and modalOverlay3 from triggering the transition again
    modalOverlay2.addEventListener('click', function (event) {
        event.stopPropagation();
    });
    modalOverlay3.addEventListener('click', function (event) {
        event.stopPropagation();
    });
            
    // Initial button state
    updateSendButtonState();
    
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

    //------------| Select Topic |------------//

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

    //------------| Analyze Problem |------------//
    async function finding_llm_respomse(base64ImageData) {
        try {
            const formData = new URLSearchParams();
            console.log('Sending image data:', base64ImageData);
            formData.append('base64_image', base64ImageData);
    
            const response = await fetch('/finding-llm/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });
    
            const result = await response.json();
            const finding_response = result.response;
            console.log('ChatGPT - 1. finding_llm:\n', finding_response);
            finding_problem_type(finding_response);
        } catch (error) {
            console.error('Error fetching ChatGPT response:', error);
        } finally {
            isWaitingForResponse = false;
        }
    };

    // function finding_problem_type(findingResponse) {
    //     const findingData = JSON.parse(findingResponse);
    //     const problem_type = findingData["유형"];
    //     console.log('ChatGPT - 2. problem_type:\n', problem_type);
    //     choose_prompt(problem_type);
    // }

    function finding_problem_type(findingResponse) {
        const findingData = JSON.parse(findingResponse);
        const problem_type = findingData["유형"];
        //-----KHJ_i-----//
        const choice_form = findingData["choice_form"]
        const problem_structure = findingData["Problem structure"]
        const problem_description = JSON.parse(problem_structure)
        console.log('ChatGPT - 2. choice_form:\n', choice_form)
        console.log('ChatGPT - 2. Problem structure:\n', problem_structure)
        console.log('ChatGPT - 2. Problem description:\n', problem_description)
        console.log('ChatGPT - 2. problem_type:\n', problem_type);
        choose_prompt(problem_type, choice_form, problem_description);
        //-----KHJ_f-----//
    }

    // async function choose_prompt(problemType) {
    //     const formData = new URLSearchParams();
    //     formData.append('problem_type', problemType);
    
    //     const response = await fetch('/choose-prompt/', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded',
    //         },
    //         body: formData
    //     });
    
    //     const result = await response.json();
    //     const solver_llm_prompt = result.prompt;
    //     console.log('ChatGPT - 3. choose_prompt:\n', solver_llm_prompt);
    //     // console.log('ChatGPT - 3. choose_prompt:\n', solver_llm_prompt);
    //     solver_llm_response(base64ImageData, solver_llm_prompt);
    // }

    //-----KHJ_i-----//
    async function choose_prompt(problemType, choice_form, problemdescription) {
        const formData = new URLSearchParams();
        formData.append('problem_type', problemType);
        formData.append('choice_form', choice_form);
        formData.append('porblem_description', problemdescription);
        const response = await fetch('/choose-prompt/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
    
        const result = await response.json();
        const solver_llm_prompt = result.prompt;
        console.log('ChatGPT - 3. choose_prompt:\n', solver_llm_prompt[0] + solver_llm_prompt[1] + solver_llm_prompt[2] + solver_llm_prompt[3]);
        // console.log('ChatGPT - 3. choose_prompt:\n', solver_llm_prompt);
        solver_llm_response(base64ImageData, solver_llm_prompt);
    }
    //-----KHJ_f-----//

    async function solver_llm_response(base64ImageData, solver_llm_prompt) {
        try {
            const formData = new URLSearchParams();
            formData.append('base64_image', base64ImageData);
            formData.append('solver_llm_prompt', solver_llm_prompt);
    
            const response = await fetch('/solver-llm/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });
    
            const result = await response.json();
            const solver_llm_response = result.response;
            console.log('ChatGPT - 4. solver_llm:\n', solver_llm_response);
            system_prompt = `[Role]
                -너는 물리를 10년 이상 가르친 경험이 있는 친절하고 이해심 많은 물리1 Tutor야.
                -학생들이 물리에 대해 질문을 할 때, 친절하게 답변해주고, 가능한 한 쉽게 이해할 수 있도록 설명해줘.
                -답을 말해주는 것이 아닌 답변으로 유도될 수 있도록 되묻는 답변을 해줘.

                [solver_llm_response]
                ${solver_llm_response}

                [Basic information]
                1. 학생들의 질문에 대해 친절하고 명확하게 답변해.
                2. 복잡한 개념은 쉽게 이해할 수 있도록 풀어서 설명해.
                3. STEP BY STEP으로 설명해줘야 해. 총 STEP은 3STEP이야.
                4. {solver_llm_response}에 근거하여 답변해.
                5. 학생들이 스스로 생각할 수 있게 질문을 생성해.
            
                [질문 생성기]
                -질문을 생성해주는 단계로써 실제로 학생들의 질문을 통해서 그 질문에 대한 적절한 방안을 제시해주기 위해 역질문을 생성한다.
                -[문제 이해하기],[STEP1],[STEP2],[STEP3]는 한번에 답변되는 것이 아닌 순서대로 이루어진다. 각 단계가 해결돼야지 다음 단계로 넘어간다.
                -[문제 이해하기]
                    -문제를 이해하게 만드는 단계
                    -1. 개념에 대해서 질문한다.
                    -2. 조건에 대해서 질문한다.
                -[STEP1]
                    -{solver_llm_response}내의 "ㄱ_풀이과정"을 이해시키기 위한 단계이다.
                    -"ㄱ_풀이과정"내의 "STEP"들을 토대로 질문을 생성한다.
                    -STEP1이 해결되지 않으면 다시 STEP1을 상세하게 설명해준다.
                    -학생이 이해가 안료된 경우만 다음 STEP2으로 넘어간다.
                -[STEP2]
                    -{solver_llm_response}내의 "ㄴ_풀이과정"을 이해시키기 위한 단계이다.
                    -"ㄴ_풀이과정"내의 "STEP"들을 토대로 질문을 생성한다.
                    -STEP2이 해결되지 않으면 다시 STEP2을 상세하게 설명해준다.
                    -학생이 이해가 안료된 경우만 다음 STEP3으로 넘어간다.
                -[STEP3]
                    -{solver_llm_response}내의 "ㄷ_풀이과정"을 이해시키기 위한 단계이다.
                    -"ㄷ_풀이과정"내의 "STEP"들을 토대로 질문을 생성한다.
                    -STEP3이 해결되지 않으면 다시 STEP3을 상세하게 설명해준다.`;
            chat_history.push(system_prompt);
            // console.log('chat_history[0] role:' + chat_history[0]["role"] + "\nchat_history[0] content:" + chat_history[0]["content"]);
            console.log("chat_history.length: ", chat_history.length);
            
            // addMessage(solver_llm_response, false);
        } catch (error) {
            console.error('Error fetching ChatGPT response:', error);
        } finally {
            isWaitingForResponse = false;
        }
    }
    

    // function finding_problem_type(finding_response) {
    //     const formData = new URLSearchParams();
    //     formData.append('finding_response', finding_response);
    //     const response = fetch('/problem-type/', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded',
    //         },
    //         body: formData
    //     });
    //     const result = response.json();
    //     const problem_type = result.response;

    //     console.log('ChatGPT - 2. problem_type:\n', problem_type);
    // };


});