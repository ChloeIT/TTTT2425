const { z } = require("zod");

const notificationSchema = {
  setReadSchema: z.object({
    ids: z.array(z.number(), {
      invalid_type_error: "Trường ids bắt buộc phải là mảng",
      message: "Cần mảng id của thông báo",
      required_error: "Mảng id là trường bắt buộc phải điền",
    }),
  }),
};
module.exports = notificationSchema;
