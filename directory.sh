#!/usr/bin/env bash
set -euo pipefail

# =========================================================
# BASE DIRECTORY (SAFE FOR GIT BASH, WSL, SSH, LINUX)
# =========================================================
BASE="$HOME/project/bugge/users"

# ---------------- USERS ----------------
USERS=("Rohan" "Eswar" "srinivas" "vinay")

# ---------------- BLOCKS ----------------
declare -A BLOCKS
BLOCKS[Rohan]="ccsa cssb"
BLOCKS[Eswar]="ccsb cssc cssd"
BLOCKS[srinivas]="arm1 arm2 arm3"
BLOCKS[vinay]="kin1 kin2 kin3 kin4"

# ---------------- RTLs ----------------
RTLS=("rtl1" "rtl2" "rtl3")

# ---------------- RUN COUNTS ----------------
declare -A RUNS

RUNS[Rohan_rtl1]=5
RUNS[Eswar_rtl1]=4
RUNS[srinivas_rtl1]=7
RUNS[vinay_rtl1]=3

RUNS[Rohan_rtl2]=3
RUNS[Eswar_rtl2]=4
RUNS[srinivas_rtl2]=6
RUNS[vinay_rtl2]=3

RUNS[Rohan_rtl3]=5
RUNS[Eswar_rtl3]=3
RUNS[srinivas_rtl3]=6
RUNS[vinay_rtl3]=4

# ---------------- FUNCTION: CREATE pd_main.csv ----------------
create_pd_main() {
  local file="$1"
  local block="$2"

  cat > "$file" <<EOF
BLOCK_NAME,$block
BLOCK_XY,X: 2100.000 Y: 2570.568
BLOCK_PORTS,5733
BLOCK_BE_OWNER,jprajapati
BLOCK_Release_tag,initRTL2_v001_r1
BLOCK_MACRO_COUNT,103
BLOCK_TCD_COUNT,2
BLOCK_ESD_COUNT,2

PLACE_OVERFLOW_HORIZONTAL/VERTICAL,0.01%/0.03%
PLACE_TIMING_QOR Group:all Setup WNS/TNS/FEP,-0.006/-0.202/298
PLACE_TIMING_QOR Group:Reg2Reg Setup WNS/TNS/FEP,-0.006/-0.129/167
PLACE_TIMING_QOR Group:all Hold WNS/TNS/FEP,-0.158/-2221.3/38819
PLACE_TIMING_QOR Group:Reg2Reg Hold WNS/TNS/FEP,-0.158/-2140.9/37033
PLACE_STDCELL_UTILIZATION,12.270%
PLACE_CORE_UTILIZATION,78.584%
PLACE_INST_COUNT,3710002
PLACE_Total Power,907.98846008

CTS_OVERFLOW_HORIZONTAL/VERTICAL,0.01%/0.02%
CTS_TIMING_QOR Group:all Setup WNS/TNS/FEP,-1.613/-2543.5/1716
CTS_TIMING_QOR Group:Reg2Reg Setup WNS/TNS/FEP,-0.058/-1.550/42
CTS_TIMING_QOR Group:all Hold WNS/TNS/FEP,-0.864/-3731.9/41517
CTS_TIMING_QOR Group:Reg2Reg Hold WNS/TNS/FEP,-0.864/-1027.8/1854
CTS_STDCELL_UTILIZATION,12.800%
CTS_CORE_UTILIZATION,78.920%
CTS_INST_COUNT,3718500
CTS_Total Power,902.55123001

ROUTE_OVERFLOW_HORIZONTAL/VERTICAL,0.00%/0.01%
ROUTE_TIMING_QOR Group:all Setup WNS/TNS/FEP,-0.423/-189.7/312
ROUTE_TIMING_QOR Group:Reg2Reg Setup WNS/TNS/FEP,-0.423/-189.7/312
ROUTE_TIMING_QOR Group:all Hold WNS/TNS/FEP,-0.215/-1245.3/12890
ROUTE_TIMING_QOR Group:Reg2Reg Hold WNS/TNS/FEP,-0.215/-1245.3/12890
ROUTE_STDCELL_UTILIZATION,13.180%
ROUTE_CORE_UTILIZATION,79.102%
ROUTE_INST_COUNT,3728401
ROUTE_Total Power,895.21458732

POST_ROUTE_OVERFLOW_HORIZONTAL/VERTICAL,0.00%/0.00%
POST_ROUTE_TIMING_QOR Group:all Setup WNS/TNS/FEP,-0.081/-12.7/19
POST_ROUTE_TIMING_QOR Group:Reg2Reg Setup WNS/TNS/FEP,-0.081/-12.7/19
POST_ROUTE_TIMING_QOR Group:all Hold WNS/TNS/FEP,-0.042/-287.4/1987
POST_ROUTE_TIMING_QOR Group:Reg2Reg Hold WNS/TNS/FEP,-0.042/-287.4/1987
POST_ROUTE_STDCELL_UTILIZATION,13.220%
POST_ROUTE_CORE_UTILIZATION,79.240%
POST_ROUTE_INST_COUNT,3730100
POST_ROUTE_Total Power,889.66321490
EOF
}

# ---------------- CREATE DIRECTORY TREE ----------------
for user in "${USERS[@]}"; do
  for block in ${BLOCKS[$user]}; do
    for rtl in "${RTLS[@]}"; do
      key="${user}_${rtl}"
      run_count="${RUNS[$key]}"

      for ((i=1; i<=run_count; i++)); do
        CSV_DIR="$BASE/$user/$block/$rtl/PD/cadence/run$i/reports/csv"
        mkdir -p "$CSV_DIR"
        create_pd_main "$CSV_DIR/pd_main.csv" "$block"
      done
    done
  done
done

echo "✅ PD directory tree + pd_main.csv created successfully under:"
echo "👉 $BASE"
