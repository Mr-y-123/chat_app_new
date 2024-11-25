import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { registeRoute } from "../utils/APIRoutes";
const Register = () => {
  const [formValue, setFormValue] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValue({ ...formValue, [name]: value });
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formValue;
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword
    ) {
      alert("somthing went wrong");
    } else {
      const { data } = await axios.post(registeRoute, {
        username,
        email,
        password,
      });
      console.log("data", data);
    }
  };
  return (
    <div>
      <h1>Register</h1>
      <form action="" onSubmit={onSubmit}>
        <div className="formcontrol">
          <label htmlFor="">username</label>
          <input
            type="text"
            placeholder="Enter user Name"
            name="username"
            value={formValue.username}
            onChange={handleChange}
          />
        </div>
        <br />
        <div className="formcontrol">
          <label htmlFor="">Email</label>
          <input
            type="email"
            placeholder="Enter Email"
            name="email"
            value={formValue.email}
            onChange={handleChange}
          />
        </div>
        <br />
        <div className="formcontrol">
          <label htmlFor="">password</label>
          <input
            type="password"
            placeholder="Enter password"
            name="password"
            value={formValue.password}
            onChange={handleChange}
          />
        </div>
        <br />
        <div className="formcontrol">
          <label htmlFor="">confirm password</label>
          <input
            type="password"
            placeholder="Enter confirm password"
            name="confirmPassword"
            value={formValue.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <br />
        <div className="formcontrol">
          <button type="submit">submit</button>
        </div>
        <br />
        <span>
          already have an account ?<Link to="/login">Login</Link>
        </span>
      </form>
    </div>
  );
};
export default Register;
