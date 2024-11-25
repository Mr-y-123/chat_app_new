import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { loginRoute } from "../utils/APIRoutes";
const Login = () => {
  const [formValue, setFormValue] = useState({
    username: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValue({ ...formValue, [name]: value });
  };
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formValue;
    if (!username || !password) {
      alert("somthing went wrong");
    } else {
      const { data } = await axios.post(loginRoute, {
        username,
        password,
      });
      if (data.status) {
        localStorage.setItem("user", JSON.stringify(data));
      }
      console.log("data", data);
    }
  };
  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/chat");
    }
  }, []);
  return (
    <div>
      <h1>Login</h1>
      <form action="" onSubmit={onSubmit}>
        <div className="formcontrol">
          <label htmlFor="">username</label>
          <input
            type="text"
            placeholder="Enter username"
            name="username"
            value={formValue.username}
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
          <button type="submit">Login</button>
        </div>
        <br />
        <span>
          Donn't have an account ?<Link to="/register">Sign-up</Link>
        </span>
      </form>
    </div>
  );
};
export default Login;
