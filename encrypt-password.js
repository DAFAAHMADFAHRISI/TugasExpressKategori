const bcrypt = require('bcryptjs');
const connection = require('./config/databases');

// Username yang akan diupdate
const username = 'dafasa';
// Password yang akan dienkripsi
const password = 'dafasa';

async function encryptAndUpdatePassword() {
  try {
    // Enkripsi password dengan bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Password yang dienkripsi:', hashedPassword);
    
    // Update password di database
    connection.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, username],
      (err, result) => {
        if (err) {
          console.error('Error saat mengupdate password:', err);
          process.exit(1);
        }
        
        console.log(`Password untuk user ${username} berhasil diupdate!`);
        console.log('Affected rows:', result.affectedRows);
        
        // Tutup koneksi database
        connection.end();
      }
    );
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Jalankan fungsi
encryptAndUpdatePassword(); 