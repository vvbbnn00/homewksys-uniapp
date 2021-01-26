'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	let data = event.queryStringParameters
	let email = data.email;
	let verify = data.verify;
	let content = data.content;
	let verify_timestamp =Math.floor((new Date()).getTime()/10000).toString();
	if (verify.toString()!==verify_timestamp) {
		return {
			code: 403,
			msg: "简单核验失败"
		}
	}
	const db = uniCloud.database();
	await db.collection("user_log").add({
		email: data.email,
		timestamp:(new Date()).getTime(),
		content: content,
	})
	return{
		code: 200,
		msg: "操作成功"
	}
	
};
