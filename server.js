const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer'); // <-- 1. ເພີ່ມ Nodemailer ທີ່ຕ້ອງໃຊ້ສົ່ງອີເມວ

const app = express();
app.use(express.json());
app.use(cors());

// ເປີດໃຫ້ອ່ານໄຟລ໌ HTML/CSS/JS ຈາກ Folder ປັດຈຸບັນ
app.use(express.static(__dirname));

// ເຊື່ອມຕໍ່ MySQL Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'olms_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL Database successfully!');
});

// ==========================================
// 1. ລະບົບຈັດການນັກຮຽນ (Student APIs)
// ==========================================

// API ຮັບຂໍ້ມູນນັກຮຽນ (ບັນທຶກ)
app.post('/api/save-student', (req, res) => {
    const { fullname, school, province, district, whatsapp, facebook, subjects, total_price } = req.body;

    const sql = `INSERT INTO students (fullname, school, province, district, whatsapp, facebook, subjects, total_price) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
        fullname, 
        school, 
        province, 
        district, 
        whatsapp, 
        facebook || '', 
        JSON.stringify(subjects), 
        total_price
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ status: 'error', message: err.message });
        }
        res.json({ status: 'success', message: 'ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ' });
    });
});

// API ດຶງຂໍ້ມູນນັກຮຽນທັງໝົດ
app.get('/api/students', (req, res) => {
    const sql = 'SELECT * FROM students ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
        res.json(results);
    });
});

// API ແກ້ໄຂຂໍ້ມູນນັກຮຽນ (PUT)
app.put('/api/update-student/:id', (req, res) => {
    const studentId = req.params.id;
    const { fullname, school, province, district, whatsapp, facebook, subjects, total_price } = req.body;

    const sql = `UPDATE students SET fullname = ?, school = ?, province = ?, district = ?, whatsapp = ?, facebook = ?, subjects = ?, total_price = ? WHERE id = ?`;
    
    const values = [
        fullname, school, province, district, whatsapp, 
        facebook || '', JSON.stringify(subjects), total_price, studentId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ status: 'error', message: err.message });
        }
        res.json({ status: 'success', message: 'ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ' });
    });
});

// API ລຶບຂໍ້ມູນນັກຮຽນ (DELETE)
app.delete('/api/delete-student/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'DELETE FROM students WHERE id = ?';

    db.query(sql, [studentId], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ status: 'error', message: err.message });
        }
        res.json({ status: 'success', message: 'ລຶບຂໍ້ມູນສຳເລັດແລ້ວ' });
    });
});


// ==========================================
// 2. ລະບົບສະມາຊິກ / ຜູ້ໃຊ້ (tbUser APIs)
// ==========================================

// API ດຶງລາຍຊື່ຜູ້ໃຊ້ທັງໝົດ
app.get('/api/users', (req, res) => {
    db.query("SELECT * FROM tbUser ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        res.json(results);
    });
});

// API ບັນທຶກຜູ້ໃຊ້ໃໝ່ (Register) ຈາກໜ້າ Login/Register ໃໝ່
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    
    const query = "INSERT INTO tbUser (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ອີເມວນີ້ອາດມີໃນລະບົບແລ້ວ!' });
        }
        res.json({ success: true, message: 'ລົງທະບຽນສຳເລັດແລ້ວ!' });
    });
});

// API ລຶບຜູ້ໃຊ້
app.delete('/api/delete-user/:id', (req, res) => {
    db.query("DELETE FROM tbUser WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        res.json({ status: 'success', message: 'ລຶບສຳເລັດ' });
    });
});

// API ກວດສອບການເຂົ້າສູ່ລະບົບ (Login)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM tbUser WHERE username = ? AND password = ?";
    
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: 'ເກີດຂໍ້ຜິດພາດໃນລະບົບ' });
        }
        
        if (results.length > 0) {
            res.json({ status: 'success', message: 'ເຂົ້າສູ່ລະບົບສຳເລັດ', user: results[0] });
        } else {
            res.json({ status: 'fail', message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ!' });
        }
    });
});


// ==========================================
// 3. ລະບົບລືມລະຫັດຜ່ານ ແລະ ສົ່ງ OTP (ເພີ່ມໃໝ່ບ່ອນນີ້)
// ==========================================

// ຕັ້ງຄ່າ Nodemailer ສຳລັບສົ່ງອີເມວ
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yermouakermoua123@gmail.com', // <-- ໃส່ອີເມວ Gmail ຂອງອ້າຍ
        pass: 'drpp rlmr jqqx zglk'           // <-- ໃສ່ App Password ຈາກ Google Account
    }
});

const otpStorage = {}; // ເກັບ OTP ຊົ່ວຄາວ

// 3.1 API: ກວດສອບອີເມວ ແລະ ສົ່ງ OTP
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    db.query('SELECT * FROM tbUser WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'ບໍ່ພົບອີເມວນີ້ໃນລະບົບ!' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStorage[email] = { otp, expires: Date.now() + 60 * 1000 }; // ໝົດອາຍຸໃນ 60 ວິນາທີ

        const mailOptions = {
            from: 'OLMS System <ອີເມວຕົວຈິງຂອງອ້າຍ@gmail.com>',
            to: email,
            subject: 'ລະຫັດຢືນຢັນ OTP ສຳລັບຣີເຊັດລະຫັດຜ່ານ',
            text: `ລະຫັດ OTP ຂອງທ່ານແມ່ນ: ${otp} (ໃຊ້ໄດ້ພາຍໃນ 1 ນາທີ)`
        };

        try {
            await transporter.sendMail(mailOptions);
            res.json({ success: true, message: 'ສົ່ງລະຫັດ OTP ໄປທີ່ອີເມວແລ້ວ!' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'ບໍ່ສາມາດສົ່ງອີເມວໄດ້', error: error.message });
        }
    });
});

// 3.2 API: ກວດສອບ OTP
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!otpStorage[email] || otpStorage[email].otp !== otp) {
        return res.status(400).json({ success: false, message: 'ລະຫັດ OTP ບໍ່ຖືກຕ້ອງ!' });
    }
    if (Date.now() > otpStorage[email].expires) {
        return res.status(400).json({ success: false, message: 'ລະຫັດ OTP ໝົດອາຍຸແລ້ວ!' });
    }
    res.json({ success: true, message: 'ຢືນຢັນ OTP ສຳເລັດ' });
});

// 3.3 API: ບັນທຶກລະຫັດຜ່ານໃໝ່
app.post('/api/reset-password', (req, res) => {
    const { email, newPassword } = req.body;
    
    db.query('UPDATE tbUser SET password = ? WHERE email = ?', [newPassword, email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        
        delete otpStorage[email];
        res.json({ success: true, message: 'ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ!' });
    });
});


// ເລີ່ມຕົ້ນ Server ທີ່ Port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});