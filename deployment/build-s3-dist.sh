#!/bin/bash

# This solution does not use CDK, The Script is used as a placeholder for code build pipeline release stage.

# This assumes all of the OS-level configuration has been completed and git repo has already been cloned
#
# This script should be run from the repo's deployment directory
# cd deployment
# ./build-s3-dist.sh source-bucket-base-name solution-name version-code
#
# Paramenters:
#  - source-bucket-base-name: Name for the S3 bucket location where the template will source the Lambda
#    code from. The template will append '-[region_name]' to this bucket name.
#    For example: ./build-s3-dist.sh solutions v1.1.0
#    The template will then expect the source code to be located in the solutions-[region_name] bucket
#
#  - solution-name: name of the solution for consistency
#
#  - version-code: version of the package

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "Please provide the base source bucket name, trademark approved solution name and version where the lambda code will eventually reside."
    echo "For example: ./build-s3-dist.sh solutions trademarked-solution-name v1.1.0"
    exit 1
fi

set -x 

# Get reference for all important folders
template_dir="$PWD"
template_dist_dir="$template_dir/global-s3-assets"
build_dist_dir="$template_dir/regional-s3-assets"

echo "------------------------------------------------------------------------------"
echo "[Init] Clean output folders"
echo "------------------------------------------------------------------------------"
rm -rf $template_dist_dir
mkdir -p $template_dist_dir
rm -rf $build_dist_dir
mkdir -p $build_dist_dir

echo "------------------------------------------------------------------------------"
echo "[Init] Add global-s3-assets and regional-s3-assets README files"
echo "------------------------------------------------------------------------------"
echo "This folder is intentionally empty because this solution is a code-only SDK." >$template_dist_dir/README.txt
echo "This folder is intentionally empty because this solution is a code-only SDK." >$build_dist_dir/README.txt

exit 0
