apt-get update
apt-get upgrade
apt-get install make git zlib1g-dev libssl-dev gperf php-cli cmake clang-18 libc++-18-dev libc++abi-18-dev
git clone https://github.com/tdlib/td.git
cd td
php SplitSource.php
rm -rf build
mkdir build
cd build
CXXFLAGS="-stdlib=libc++" CC=/usr/bin/clang-18 CXX=/usr/bin/clang++-18 cmake -DCMAKE_BUILD_TYPE=Debug -DCMAKE_INSTALL_PREFIX:PATH=/usr/local -DTD_ENABLE_LTO=ON -DCMAKE_AR=/usr/bin/llvm-ar-18 -DCMAKE_NM=/usr/bin/llvm-nm-18 -DCMAKE_OBJDUMP=/usr/bin/llvm-objdump-18 -DCMAKE_RANLIB=/usr/bin/llvm-ranlib-18 ..
cmake --build . --target install
cd ..
php SplitSource.php --undo
cd ..
ls -l /usr/local
