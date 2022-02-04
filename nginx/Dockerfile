FROM openvidu/openvidu-proxy:7.0.0

# This is a workaround to allow NGINX to connect to OpenVidu on Mac OS without using "network_mode: host" in Docker
RUN sed -i "s/localhost/openvidu/" /default_nginx_conf/ce/default.conf
