import { useState } from "react";
import { uploadFile } from "../utils/APIRoutes";
import axios from "axios";
const UploadFile = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    uploadedImages: null,
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData);
    const data = new FormData();
    data.append("firstname", formData.firstname);
    if (formData?.uploadedImages?.length != 0) {
      for (const single_file of formData.uploadedImages) {
        console.log(single_file);
        data.append("uploadedImages", single_file);
      }
    }

    const response = await axios.post(uploadFile, data);
    console.log(response);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="firstname"
        onChange={(e) =>
          setFormData({ ...formData, firstname: e.target?.value })
        }
      />
      <input
        type="file"
        name="uploadedImages"
        multiple={true}
        onChange={(e) => {
          console.log(e.target.files),
            setFormData({ ...formData, uploadedImages: e.target.files });
        }}
      />
      <input type="submit" />
    </form>
  );
};
export default UploadFile;
