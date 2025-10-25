// validation.js
export function makeValidator(policy = {}) {
  const {
    // ตั้งค่าเริ่มต้น (ปรับได้)
    emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,

    usernameMinLen = 3,
    usernamePattern = /^[A-Za-z0-9_.-]+$/,

    passMinLen = 8,
    passRequireUpper = true,
    passRequireLower = true,
    passRequireNumber = true,
    passRequireSpecial = true,
    passDisallowSpaces = true,
  } = policy;

  return function Validation(values) {
    const errors = {};

    // EMAIL
    if (!values.email) {
      errors.email = "กรุณากรอกอีเมล";
    } else if (!emailPattern.test(values.email)) {
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    // USERNAME
    if (!values.username) {
      errors.username = "กรุณากรอกชื่อผู้ใช้";
    } else if (values.username.length < usernameMinLen) {
      errors.username = `ชื่อผู้ใช้ต้องยาวอย่างน้อย ${usernameMinLen} ตัวอักษร`;
    } else if (!usernamePattern.test(values.username)) {
      errors.username = "ใช้ได้เฉพาะ a-z, 0-9, _, ., -";
    }

    // PASSWORD
    const pwd = values.password || "";
    if (!pwd) {
      errors.password = "กรุณากรอกรหัสผ่าน";
    } else {
      if (pwd.length < passMinLen) {
        errors.password = `รหัสผ่านอย่างน้อย ${passMinLen} ตัว`;
      } else if (passDisallowSpaces && /\s/.test(pwd)) {
        errors.password = "รหัสผ่านห้ามมีช่องว่าง";
      } else if (passRequireLower && !/[a-z]/.test(pwd)) {
        errors.password = "ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว";
      } else if (passRequireUpper && !/[A-Z]/.test(pwd)) {
        errors.password = "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว";
      } else if (passRequireNumber && !/\d/.test(pwd)) {
        errors.password = "ต้องมีตัวเลขอย่างน้อย 1 ตัว";
      } else if (passRequireSpecial && !/[^\w\s]/.test(pwd)) {
        errors.password = "ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว";
      }
    }

    return errors;
  };
}
