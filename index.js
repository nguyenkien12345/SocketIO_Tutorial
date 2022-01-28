const express = require('express');
const app = express();


// Setup Views
app.set('view engine','ejs');       // Thư viện view engine mà ta cài đặt là ejs
app.set('views','./views');         // Thư mục chứa các file view hiển thị và đường dẫn đến folder views đó
app.use(express.static('public'));  // Setup đường dẫn đến folder tĩnh


// Setup Server
const server = require('http').Server(app);
var io = require('socket.io')(server);


// Setup: Server sẽ lắng nghe các thiết bị bên dưới kết nối lên. Cứ có người kết nối lên server thì server nó sẽ chạy callback bên dưới
io.on('connection', (socket) => {
    // Cứ mỗi 1 người kết nối lên server thì server nó sẽ tạo ra cho người đó 1 cái id để phân biệt
    console.log("Có người kết nối lên server: " + socket.id)
    // Tại 1 trang web client có rất nhiều hành động có thể gửi lên server như register, login, chat message, call video, buy product,... Nên Server nó cũng cần phải phân biệt, nhận biết được người dùng gửi hành động gì lên server (Ta cần đặt tên (tên gì cũng được) cho cái hành động mà client gửi lên để đảm bảo rằng client và server vừa lắng nghe và nhận đúng dữ liệu mà client muốn truyền lên server). Client gửi hành động tên gì thì Server phải nhận về hành động tên đó (ở đây client gửi lên hành động action thì server nhận về hành động action). data chính là cái dữ liệu mà phía client gửi lên, server nó sẽ nhận dữ liệu về thông qua biến data
    socket.on("action",(data) => {
        let result = `Xin chào ${data}`;
        // Sau khi nhận dữ liệu server muốn truyền dữ liệu này về cho ai??? (Gửi cho 1 cá nhân cụ thể, gửi cho cả công ty, gửi cho 1 nhóm người chỉ định,...)
        // socket.emit("server-emit",result);
        // socket.broadcast.emit("server-emit",result);
        io.sockets.emit("server-emit",result);
    })
})


app.get('/', (req,res) => {
    res.render('home'); // Hiển thị file home.ejs
})


const PORT = process.env.PORT || 5000;
// Đối với socket.io thì phải là server lắng nghe chứ không phải app (giúp các thiết bị có thể realtime với nhau)
server.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
})


// Lý thuyết
// - Các thiết bị không thể truyền dữ liệu trực tiếp qua nhau mà phải thông qua server
// - Biến app chỉ dùng quản trị các cái route (vd: app.get, app.post, app.delete,...)
// - Biến io quản trị việc realtime data
// - Luồng chạy: Có 2 người. 1 người dùng điện thoại samsung, 1 người dùng điện thoại apple. Khi cái thằng samsung nó bấm nút gọi lên server thì server nó sẽ chạy hàm callback của nó và tạo ra 1 cái biến socket. Cái biến socket này nẳm trong bộ nhớ của server. Server nó trích ra 1 vùng nhớ tên là socket (ta tự đặt tên biến) và cái vùng nhớ (biến socket) này sẽ dùng để quản trị cho thằng samsung. Tương tự cái thằng apple vài phút sau nó bấm nút gọi lên server. Server nó cũng sẽ chạy lại cái callback đó và tạo ra 1 biến socket nữa và cái biến socket đó chỉ dùng để quản trị cho thằng apple
// - Cứ mỗi 1 khách hàng thì server nó sẽ tạo ra 1 biến socket dành riêng cho khách hàng đó
// - Cứ nói đến socket là nói đến cái máy mà đang kết nối lên server (Cái thằng mà bắn dữ liệu lên server)
// - emit(): Nhận vào 2 tham số: thứ 1 là tên action, thứ 2 là truyền cái gì 
// - https://socket.io/docs/v4/emit-cheatsheet (Các loại hàm emit trong socket io và từng trường hợp sử dụng emit nào emit nào)
// - socket.emit(): ai là cái thằng gửi lên server, nó đang on (lắng nghe) của socket nào thì server chỉ emit (trả dữ liệu) về cái socket đó thôi. Những thằng xung quanh sẽ không nhận được dữ liệu này. Ai emit lên thì server sẽ bắn về nó
// - socket.broadcast.emit(): Ví dụ bạn chơi game online => Khi bạn chat thì toàn bộ người chơi khác sẽ thấy tin nhắn của bạn chỉ ngoại trừ duy nhất chính bản thân bạn vì bạn là người gửi nên bạn sẽ không phải nhận lại chính tin nhắn của chính bản thân mình gửi (to all clients in the current namespace except the sender)
// - io.sockets.emit(): Gửi cho tất cả mọi người bao gồm cả bản thân mình luôn (sockets có nghĩa là bao gồm tất cả các socket (Nghĩa là tất cả các máy mà đang kết nối đến server))