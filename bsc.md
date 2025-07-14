# bsc

bsc chain and bsc testnet chain.

## bsc chain

sync bsc chain

[https://github.com/48Club/bsc-snapshots](https://github.com/48Club/bsc-snapshots)

```bash
# https://github.com/48Club/bsc-snapshots
setsid aria2c -s4 -x4 -k1024M -o snapshot.tar.zst $SNAPSHOT_URL > fetch.log 2>&1 &

# checksum 
pv snapshot.tar.zst | openssl md5

# get the data.json config files.
git clone https://github.com/48Club/bsc-snapshots.git

# mainnet.zip, geth, config.toml
wget from https://github.com/bnb-chain/bsc/releases/tag/v1.5.17

mkdir -p /data/bsc/snapshot
pv snapshot.tar.zst | tar --use-compress-program="zstd -d" -xf - -C /data/bsc/snapshot
cp /data/bsc-snapshots/data.json /data/bsc/snapshot/fast/
apt install jq

# delete old nodekey
cd geth
rm -f nodekey

/data/start.sh
```

**start.sh**:

```bash
#!/bin/bash

BASE_DIR="/data/bsc/snapshot/fast"
DATADIR="$BASE_DIR/geth"
DATA_JSON="$BASE_DIR/data.json"
LOGFILE="$BASE_DIR/geth.log"
CONFIG_FILE="$BASE_DIR/config.toml"   # ⬅️ 你的 config 路径

# 检查 jq 是否存在
if ! command -v jq &> /dev/null; then
    echo "❌ 错误：请先安装 jq：sudo apt install jq"
    exit 1
fi

# 提取启动参数
export GETH_OVERRIDE_IMMUTABILITYTHRESHOLD=$(jq -r '.geth.none.env.GETH_OVERRIDE_IMMUTABILITYTHRESHOLD' "$DATA_JSON")
FLAGS=$(jq -r '.geth.none.flags' "$DATA_JSON")

# 追加你自己的参数
EXTRA_FLAGS="--config $CONFIG_FILE --cache 40000"

# 日志文件夹创建
mkdir -p "$(dirname "$LOGFILE")"

# 启动 geth（后台运行）
echo "🚀 正在启动 Geth Fast Node..."
echo "📄 日志记录：$LOGFILE"
setsid geth --datadir "$DATADIR" $FLAGS $EXTRA_FLAGS >> "$LOGFILE" 2>&1 &
echo "✅ Geth 已后台运行 (PID: $!)"

```

update the `data.json`:

main added the `--history.transactions=360000 --syncmode=full --ws --ws.api eth,net,web3,txpool  --db.engine=pebble --tries-verify-mode=none`

```json
{
    "geth": {
        "none": {
            "link": "https://complete.snapshots.48.club/geth.fast.52711000.tar.zst",
            "md5": "8fca75a1ba8bf307cd83db17939fb63d",
            "env": {
                "GETH_OVERRIDE_IMMUTABILITYTHRESHOLD": 244800
            },
            "flags": "--history.transactions=360000 --syncmode=full --ws --ws.api eth,net,web3,txpool  --db.engine=pebble --tries-verify-mode=none"
        },
        "local": {
            "link": "https://complete.snapshots.48.club/geth.full.52711000.tar.zst",
            "md5": "fdac12485a9eed7189f9317da2b0fca8",
            "env": {
                "GETH_OVERRIDE_IMMUTABILITYTHRESHOLD": 244800
            },
            "flags": "--history.transactions=360000 --syncmode=full --db.engine=pebble --tries-verify-mode=local"
        }
    },
    "erigon": {
        "fast": {
            "link": "https://complete.snapshots.48.club/erigon.52186763.tar.zst",
            "md5": "4e36fbf810ed101da7cffd36bb519863",
            "env": {
                "ERIGON_DISCARD_COMMITMENT": true
            },
            "flags": "--prune.mode=archive --prune.distance.blocks=360000 --prune.distance=360000 --sync.loop.block.limit=90000 --db.pagesize=16kb --txpool.disable --diagnostics.disabled --batchSize=4096m --bodies.cache=4294967296"
        }
    }
}
```

## bsc testnet chain

sync the **bsc** testnet chain

[https://github.com/bnb-chain/bsc-snapshots](https://github.com/bnb-chain/bsc-snapshots)

```bash
# use the pbss, download the mirror package.
setsid aria2c -s4 -x4 -k1M -d /data/testnet_download -o testnet.tar.lz4 "https://pub-c0627345c16f47ab858c9469133073a8.r2.dev/testnet-geth-pbss-20240711.tar.lz4" >> /data/testnet_download/fetch.log 2>&1 &

# checksum the result of package.
md5sum testnet.tar.lz4

# download the testnet.zip.
https://github.com/bnb-chain/bsc/releases/tag/v1.5.17

# unzip testnet.zip and get the config.toml
unzip testnet.zip

mkdir -p /data/bsc/testnet

# unpack the package.
setsid lz4 -dc /data/testnet_download/testnet.tar.lz4 | tar -xvf - -C /data/bsc/testnet >> /data/bsc/testnet/unpack.log 2>&1 &

# run geth
/data/start_testnet.sh
```

**start_testnet.sh**:

```bash
#!/bin/bash

# 设置目录路径
BASE_DIR="/data/bsc/testnet/server/testnet/dataseed"
DATADIR="$BASE_DIR/geth"
CONFIG="$BASE_DIR/config.toml"
LOGFILE="$BASE_DIR/geth.log"

# 环境变量：避免快照区块过旧报错
export GETH_OVERRIDE_IMMUTABILITYTHRESHOLD=244800

# 确保 config.toml 存在
if [ ! -f "$CONFIG" ]; then
    echo "❌ 缺少配置文件：$CONFIG"
    exit 1
fi

# 创建日志目录
mkdir -p "$(dirname "$LOGFILE")"

# 启动 Geth Testnet
echo "🚀 正在启动 Geth Testnet..."
echo "📄 日志记录：$LOGFILE"
setsid geth \
  --datadir "$DATADIR" \
  --history.transactions=360000 \
  --syncmode=full \
  --ws \
  --ws.api eth,net,web3,txpool \
  --db.engine=pebble \
  --tries-verify-mode=none \
  --config "$CONFIG" \
  --cache 40000 \
  >> "$LOGFILE" 2>&1 &

echo "✅ Geth Testnet 已后台运行 (PID: $!)"

```

if peer count too low, we should do this:

```bash
# remove nodekey and generate new nodekey
rm -f nodekey

# add history.transactions
geth --history.transactions=360000 

# add GETH_OVERRIDE_IMMUTABILITYTHRESHOLD one day.
export GETH_OVERRIDE_IMMUTABILITYTHRESHOLD=244800
```

and **web3** command:

```bash
# use ipc and stable
geth attach /data/bsc/testnet/server/testnet/dataseed/geth/geth.ipc

web3.eth.syncing
web3.eth.getBlock("latest").number
web3.eth.blockNumber
web3.net
```
