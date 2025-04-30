const { Client } = require('pg');

// แสดงว่าโปรแกรมเริ่มทำงาน
console.log('========== เริ่มการทดสอบเชื่อมต่อ PostgreSQL ==========');
console.log('กำลังเริ่มทำงาน...');

// สร้าง Client ด้วยข้อมูลการเชื่อมต่อ
const client = new Client({
  user: 'databass_botpb',
  password: '2JKIgqc7IE1FKPBtvwMDEnB19r6pGsEN',
  host: 'render psql dpg-d08onthr0fns73dl4pp0-a',
  port: 5432,
  database: 'databass_botpb',
  ssl: {
    rejectUnauthorized: false
  }
});

// ทดสอบการเชื่อมต่อแบบชัดเจนด้วย callback
console.log('กำลังเชื่อมต่อกับฐานข้อมูล...');

client.connect(function(err) {
  // ตรวจสอบว่าเชื่อมต่อสำเร็จหรือไม่
  if (err) {
    console.error('❌ การเชื่อมต่อล้มเหลว!');
    console.error('ข้อความผิดพลาด:', err.message);
    return;
  }
  
  console.log('✅ เชื่อมต่อสำเร็จ!');
  
  // ทดสอบ query ข้อมูล
  client.query('SELECT NOW() as server_time', function(err, result) {
    if (err) {
      console.error('❌ ไม่สามารถ query ข้อมูลได้:', err.message);
    } else {
      console.log('✅ Query สำเร็จ!');
      console.log('เวลาของเซิร์ฟเวอร์:', result.rows[0].server_time);
    }
    
    // ปิดการเชื่อมต่อ
    client.end(function(err) {
      if (err) {
        console.error('❌ เกิดข้อผิดพลาดขณะปิดการเชื่อมต่อ:', err.message);
      } else {
        console.log('✅ ปิดการเชื่อมต่อสำเร็จ');
      }
      console.log('========== สิ้นสุดการทดสอบ ==========');
    });
  });
});

// แสดงว่าการทดสอบกำลังดำเนินอยู่
console.log('โปรแกรมกำลังดำเนินการทดสอบ กรุณารอผลลัพธ์...');