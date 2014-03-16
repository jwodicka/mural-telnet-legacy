if [ ! -d "redis" ]; then
  curl http://download.redis.io/redis-stable.tar.gz -o redis-stable.tar.gz &&
  tar xzf redis-stable.tar.gz &&
  mv redis-stable redis &&
  cd redis &&
  make;
  cd .. &&
  rm redis-stable.tar.gz;
fi
