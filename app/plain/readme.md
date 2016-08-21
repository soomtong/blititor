## A simple demo pages 

just use normal html pages with introduce some features for administrators and managers

### Nginx location proxy for prefixed url

use specified url for location module then confirm the end of location '/'

`/` == `host:post/` pattern is same to 
`/plain/` == `host:post/` pattern 

```
100 server {
101     server_name demo.blititor.com;
102
103     client_body_in_file_only clean;
104     client_body_buffer_size 32K;
105
106     client_max_body_size 20M;
107
108     sendfile on;
109     send_timeout 300s;
110
111     location /plain/ {
112         proxy_set_header X-Real-IP $remote_addr;
113         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
114         proxy_set_header Host $http_host;
115         proxy_set_header X-NginX-Proxy true;
116         proxy_pass http://127.0.0.1:3011/;
117         proxy_redirect off;
118     }
119 }
```

### History

- 1.0.0: initial release

### Credit

soomtong (soomtong@gmail.com)