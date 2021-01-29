'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	//event为客户端上传的参数	
	let data = event.queryStringParameters;
	let email = data.email;
	let verify = data.verify;
	let content = data.content;
	if (verify.toString() !== "FBWEV24r234f32g3g___e64_wtghe5yjrumyejhw4tq53gh463j47wedewf2333JKFOWaib") {
		return {
			code: 403,
			msg:"简单核验失败"
		}
	}
	let collection = db.collection("user_log");
	let result = await collection.add({
		email: email,
		timestamp: (new Date()).getTime(),
		content: content
	})
	return {
		code: 200,
		msg: "操作成功",
		cloud_result: JSON.stringify(result.result)
	}
};
