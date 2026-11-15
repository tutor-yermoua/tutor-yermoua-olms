// ຟັງຊັນກົດເປີດ-ປິດຕາ ເພື່ອເບິ່ງລະຫັດຜ່ານ
function togglePassword(inputId, iconElement) {
    const inputField = document.getElementById(inputId);
    if (inputField.type === 'password') {
        inputField.type = 'text';
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    } else {
        inputField.type = 'password';
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    }
}

// ຟັງຊັນສະຫຼັບໜ້າລະຫວ່າງ Login ກับ Forgot Password
function switchForm(formType) {
    const loginBox = document.getElementById('loginBox');
    const forgotBox = document.getElementById('forgotBox');

    if (loginBox) loginBox.style.display = 'none';
    if (forgotBox) forgotBox.style.display = 'none';

    if (formType === 'forgot') {
        if (forgotBox) {
            forgotBox.style.display = 'block';
            document.getElementById('step-email-form').style.display = 'block';
            document.getElementById('step-otp-form').style.display = 'none';
            document.getElementById('step-new-pass-form').style.display = 'none';
        }
    } else {
        if (loginBox) loginBox.style.display = 'block';
    }
}
// 2. ຟັງຊັນກວດສອບการເຂົ້າສູ່ລະບົບ (Login)
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const modal = document.getElementById('loadingModal');
    const spinnerContainer = document.getElementById('spinnerContainer');
    const successCheck = document.getElementById('successCheck');
    const loadingText = document.getElementById('loadingText');

    modal.style.display = 'flex';
    spinnerContainer.style.display = 'block';
    successCheck.style.display = 'none';
    loadingText.innerHTML = `ກຳລັງເຂົ້າສູ່ລະບົບ<span class="dots"><span>.</span><span>.</span><span>.</span></span>`;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.status === 'success') {
            const userData = { username: username };
            localStorage.setItem('currentUser', JSON.stringify(userData));

            setTimeout(() => {
                spinnerContainer.style.display = 'none';
                successCheck.style.display = 'block';
                loadingText.innerHTML = `ເຂົ້າສູ່ລະບົບສຳເລັດ<span class="dots"><span>.</span><span>.</span><span>.</span></span>`;

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);

            }, 1500);

        } else {
            modal.style.display = 'none';
            alert('ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        modal.style.display = 'none';
        alert('ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບ Server ໄດ້');
    }
});

// ================= 3. ລະບົບລືມລະຫັດຜ່ານ ແລະ OTP =================
let targetEmail = "";

// 3.1 ສົ່ງອີເມວຂໍ OTP
async function requestOTP() {
    targetEmail = document.getElementById('reset-email').value;
    if (!targetEmail) {
        alert('ກະລຸນາປ້ອນອີເມວກ່ອນ!');
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail })
        });
        const data = await res.json();
        alert(data.message);
        if (data.success) {
            document.getElementById('step-email-form').style.display = 'none';
            document.getElementById('step-otp-form').style.display = 'block'; // ເປີດໜ້າໃສ່ OTP
        }
    } catch (error) {
        console.error('Error:', error);
        alert('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ Server');
    }
}

// 3.2 ກວດສອບ OTP
async function verifyOTP() {
    const otp = document.getElementById('otp-code').value;
    if (!otp) {
        alert('ກະລຸນາປ້ອນລະຫັດ OTP!');
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail, otp })
        });
        const data = await res.json();
        alert(data.message);
        if (data.success) {
            document.getElementById('step-otp-form').style.display = 'none';
            document.getElementById('step-new-pass-form').style.display = 'block'; // ເປີດໜ້າປ່ຽນລະຫັດ
        }
    } catch (error) {
        console.error('Error:', error);
        alert('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ Server');
    }
}

// 3.3 ບັນທຶກລະຫັດຜ່ານໃໝ່
async function resetPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!newPassword || !confirmPassword) {
        alert('ກະລຸນາປ້ອນລະຫັດຜ່ານໃໝ່ໃຫ້ຄົບຖ້ວນ!');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('ລະຫັດຜ່ານທັງສອງບໍ່ກົງກັນ!');
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail, newPassword })
        });
        const data = await res.json();
        alert(data.message);
        if (data.success) {
            window.location.reload(); // ກັບຄືນໜ້າເຂົ້າສູ່ລະບົບ
        }
    } catch (error) {
        console.error('Error:', error);
        alert('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ Server');
    }
}