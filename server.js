const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

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

// API ຮັບຂໍ້ມູນຈາກ Frontend ເພື່ອບັນທຶກລົງ MySQL
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

// API ດຶງຂໍ້ມູນນັກຮຽນທັງໝົດໄປສະແດງຜົນ
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

// --- API ໃໝ່: ແກ້ໄຂຂໍ້ມູນນັກຮຽນ (PUT) ---
app.put('/api/update-student/:id', (req, res) => {
    const studentId = req.params.id;
    const { fullname, school, province, district, whatsapp, facebook, subjects, total_price } = req.body;

    const sql = `UPDATE students SET fullname = ?, school = ?, province = ?, district = ?, whatsapp = ?, facebook = ?, subjects = ?, total_price = ? WHERE id = ?`;
    
    const values = [
        fullname, 
        school, 
        province, 
        district, 
        whatsapp, 
        facebook || '', 
        JSON.stringify(subjects), 
        total_price,
        studentId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ status: 'error', message: err.message });
        }
        res.json({ status: 'success', message: 'ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ' });
    });
});

// --- API ໃໝ່: ລຶບຂໍ້ມູນນັກຮຽນ (DELETE) ---
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

// ເລີ່ມຕົ້ນ Server ທີ່ Port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});