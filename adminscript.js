const bcrypt = require('bcryptjs');

// Function to encrypt a provided password
async function encryptPassword(plainPassword) {
  try {
    // Hash the password with bcrypt (10 is the salt rounds)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    console.log('Encrypted password:', hashedPassword);
    return hashedPassword;
    
  } catch (error) {
    console.log('Error encrypting password:', error);
    throw error;
  }
}

// Function to verify a password against a hash
async function verifyPassword(plainPassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Password match:', isMatch);
    return isMatch;
  } catch (error) {
    console.log('Error verifying password:', error);
    throw error;
  }
}

// Usage example
async function main() {
  const userPassword = 'Raju@202488'; // The password you want to encrypt

  // Encrypt the password
  const hashed = await encryptPassword(userPassword);
  
  // Verify the password
  await verifyPassword(userPassword, hashed); // Should return true
  await verifyPassword('wrongpassword', hashed); // Should return false
}

main();