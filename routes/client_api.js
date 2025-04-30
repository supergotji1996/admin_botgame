// client_api.js
const express = require('express');
const router = express.Router();
const db = require('../models/database');
const botUsersModel = require('../models/bot_users');

// API สำหรับแอป C# ตรวจสอบการเข้าสู่ระบบ
router.post('/client/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // สร้าง platform_id จาก username และ password
        const crypto = require('crypto');
        const platformId = crypto.createHash('sha256').update(username + password).digest('hex');
        
        // ตรวจสอบว่ามีผู้ใช้ในฐานข้อมูลหรือไม่
        const userResult = await db.query(
            'SELECT * FROM bot_users WHERE username = $1 AND platform_id = $2 AND is_active = true', 
            [username, platformId]
        );
        
        if (userResult.rows.length > 0) {
            // อัปเดตสถานะออนไลน์
            await db.query(
                'UPDATE bot_users SET online_status = true, last_active = CURRENT_TIMESTAMP WHERE username = $1',
                [username]
            );
            
            return res.json({
                success: true,
                user: {
                    id: userResult.rows[0].id,
                    username: userResult.rows[0].username,
                    is_premium: userResult.rows[0].is_premium
                }
            });
        }
        
        // ตรวจสอบว่ามีผู้ใช้แต่ยังไม่ได้รับการอนุมัติ
        const pendingUserResult = await db.query(
            'SELECT * FROM bot_users WHERE username = $1 AND platform_id = $2 AND is_active = false', 
            [username, platformId]
        );
        
        if (pendingUserResult.rows.length > 0) {
            return res.json({
                success: false,
                message: 'บัญชีของคุณยังไม่ได้รับการอนุมัติ กรุณาติดต่อผู้ดูแลระบบ'
            });
        }
        
        return res.json({
            success: false,
            message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        res.status(500).json({ 
            success: false,
            message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        });
    }
});

// API สำหรับแอป C# ลงทะเบียนผู้ใช้ใหม่
router.post('/client/register', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // สร้าง platform_id จาก username และ password
        const crypto = require('crypto');
        const platformId = crypto.createHash('sha256').update(username + password).digest('hex');
        
        // ตรวจสอบว่ามีชื่อผู้ใช้นี้อยู่แล้วหรือไม่
        const existingUser = await db.query(
            'SELECT * FROM bot_users WHERE username = $1', 
            [username]
        );
        
        if (existingUser.rows.length > 0) {
            return res.json({
                success: false,
                message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว'
            });
        }
        
        // ลงทะเบียนผู้ใช้ใหม่
        const newUser = await botUsersModel.createUser({
            username,
            platform_id: platformId
        });
        
        return res.json({
            success: true,
            message: 'ลงทะเบียนสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ',
            user: {
                id: newUser.id,
                username: newUser.username
            }
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        res.status(500).json({ 
            success: false,
            message: 'เกิดข้อผิดพลาดในการลงทะเบียน'
        });
    }
});

// API สำหรับแอป C# ให้ผู้ใช้ออกจากระบบ
router.post('/client/logout', async (req, res) => {
    const { username } = req.body;
    
    try {
        // อัปเดตสถานะออนไลน์เป็น false
        await db.query(
            'UPDATE bot_users SET online_status = false, last_active = CURRENT_TIMESTAMP WHERE username = $1',
            [username]
        );
        
        return res.json({
            success: true,
            message: 'ออกจากระบบสำเร็จ'
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        res.status(500).json({ 
            success: false,
            message: 'เกิดข้อผิดพลาดในการออกจากระบบ'
        });
    }
});

// API สำหรับแอป C# ดึงข้อมูลผู้ใช้
router.get('/client/user/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
        const userResult = await db.query(
            'SELECT id, username, is_active, is_premium, online_status, registration_date, last_active FROM bot_users WHERE username = $1', 
            [username]
        );
        
        if (userResult.rows.length > 0) {
            return res.json({
                success: true,
                user: userResult.rows[0]
            });
        }
        
        return res.json({
            success: false,
            message: 'ไม่พบผู้ใช้'
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        res.status(500).json({ 
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
        });
    }
});

module.exports = router;