const fs = require('fs');
const path = require('path');

// Fix 1: Remove foojay toolchain resolver (incompatible with Gradle 9)
const foojayFile = path.join(
  __dirname,
  '../node_modules/@react-native/gradle-plugin/settings.gradle.kts',
);
if (fs.existsSync(foojayFile)) {
  const content = fs.readFileSync(foojayFile, 'utf8');
  const patched = content.replace(
    /plugins\s*\{\s*id\("org\.gradle\.toolchains\.foojay-resolver-convention"\)\.version\("[^"]*"\)\s*\}/,
    '// foojay toolchain resolver removed',
  );
  if (patched !== content) {
    fs.writeFileSync(foojayFile, patched);
    console.log('[postinstall] Removed foojay plugin from @react-native/gradle-plugin');
  }
}

// Fix 2: Create missing build.gradle.kts for expo-module-gradle-plugin
// The file exists in the expo GitHub repo but is missing from the npm package.
const pluginDir = path.join(
  __dirname,
  '../node_modules/expo-modules-core/expo-module-gradle-plugin',
);
const buildFile = path.join(pluginDir, 'build.gradle.kts');
if (fs.existsSync(pluginDir) && !fs.existsSync(buildFile)) {
  const content = `import org.gradle.api.tasks.testing.logging.TestExceptionFormat
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
  kotlin("jvm") version "2.1.20"
  id("java-gradle-plugin")
}

repositories {
  google()
  mavenCentral()
}

val gradleProperties = project
  .rootProject
  .gradle
  .parent
  ?.extensions
  ?.extraProperties

val expoAutolinkingSettingsPlugin = if (gradleProperties?.has("expoAutolinkingSettingsPlugin") == true) {
  gradleProperties.get("expoAutolinkingSettingsPlugin") as? Boolean
} else {
  false
}

val isExpoAutolinkingSettingsPluginAvailable = expoAutolinkingSettingsPlugin == true

dependencies {
  implementation(gradleApi())
  compileOnly("com.android.tools.build:gradle:8.5.0")
  implementation("com.facebook.react:react-native-gradle-plugin")
  implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
  implementation("io.github.lukmccall.pika:pika-gradle:0.3.2")

  if (isExpoAutolinkingSettingsPluginAvailable) {
    implementation("expo.modules:expo-autolinking-plugin-shared")
  }

  testImplementation("junit:junit:4.13.2")
  testImplementation("com.google.truth:truth:1.1.2")
}

java {
  sourceCompatibility = JavaVersion.VERSION_11
  targetCompatibility = JavaVersion.VERSION_11

  sourceSets {
    val path = if (isExpoAutolinkingSettingsPluginAvailable) {
      "withAutolinkingPlugin"
    } else {
      "withoutAutolinkingPlugin"
    }
    getByName("main").java.srcDirs("src/\${path}/kotlin")
  }
}

tasks.withType<KotlinCompile> {
  compilerOptions {
    jvmTarget.set(JvmTarget.JVM_11)
  }
}

group = "expo.modules"

gradlePlugin {
  plugins {
    register("expoModulesGradlePlugin") {
      id = "expo-module-gradle-plugin"
      implementationClass = "expo.modules.plugin.ExpoModulesGradlePlugin"
    }
  }
}

tasks.withType<Test>().configureEach {
  testLogging {
    exceptionFormat = TestExceptionFormat.FULL
    showExceptions = true
    showCauses = true
    showStackTraces = true
  }
}
`;
  fs.writeFileSync(buildFile, content);
  console.log('[postinstall] Created build.gradle.kts for expo-module-gradle-plugin');
}

// Fix 3: Create missing Version.kt for expo-module-gradle-plugin
// These source files exist on GitHub but are missing from the npm package.
const pluginSrcDir = path.join(pluginDir, 'src/main/kotlin/expo/modules/plugin');
const versionFile = path.join(pluginSrcDir, 'Version.kt');
if (fs.existsSync(pluginSrcDir) && !fs.existsSync(versionFile)) {
  fs.writeFileSync(
    versionFile,
    `package expo.modules.plugin

data class Version(
  val major: Int,
  val minor: Int,
  val patch: Int
) {
  fun isAtLeast(other: Version): Boolean {
    return major > other.major ||
      (major == other.major && minor > other.minor) ||
      (major == other.major && minor == other.minor && patch >= other.patch)
  }

  fun isAtLeast(major: Int, minor: Int, patch: Int): Boolean {
    return isAtLeast(Version(major, minor, patch))
  }

  fun toNumber(): Int {
    return major * 10000 + minor * 100 + patch
  }

  companion object {
    fun fromString(value: String): Version {
      // strip pre-release
      val normalizedValue = value.substringBefore('-')
      val (major, minor, patch) = normalizedValue.split(".").map { it.toInt() }
      return Version(major, minor, patch)
    }
  }
}
`,
  );
  console.log('[postinstall] Created Version.kt for expo-module-gradle-plugin');
}

// Fix 4: Create missing Warnings.kt for expo-module-gradle-plugin
const warningsFile = path.join(pluginSrcDir, 'Warnings.kt');
if (fs.existsSync(pluginSrcDir) && !fs.existsSync(warningsFile)) {
  fs.writeFileSync(
    warningsFile,
    `package expo.modules.plugin

import org.slf4j.Logger

private val notDefinedKeys = mutableSetOf<String>()

fun <T> Logger.warnIfNotDefined(name: String, defaultValue: T): T = synchronized(notDefinedKeys) {
  if (!notDefinedKeys.contains(name)) {
    notDefinedKeys.add(name)
    warn("Property '\$name' is not defined. Using default value: '\$defaultValue'. Please ensure the 'expo-root-project' plugin is applied to your root project.")
  }
  return defaultValue
}
`,
  );
  console.log('[postinstall] Created Warnings.kt for expo-module-gradle-plugin');
}

// Fix 5: Extract missing TypeScript codegen specs from npm tarballs
// These files are in the published tarballs but not extracted by npm due to how
// the packages structure their files field vs what npm actually extracts.
const https = require('https');
const { execSync } = require('child_process');

function extractSpecsFromTarball(tarballUrl, destDir, tarSubdir) {
  if (!fs.existsSync(destDir)) return;
  const existing = fs.readdirSync(destDir).filter((f) => f.endsWith('.ts'));
  if (existing.length > 0) return; // already have spec files

  try {
    const tmpDir = require('os').tmpdir() + '/izi-postinstall-' + Date.now();
    fs.mkdirSync(tmpDir, { recursive: true });
    execSync(`curl -sf "${tarballUrl}" | tar -xz -C "${tmpDir}" 2>/dev/null`, {
      shell: '/bin/bash',
    });
    const srcDir = path.join(tmpDir, 'package', tarSubdir);
    if (fs.existsSync(srcDir)) {
      fs.readdirSync(srcDir).forEach((f) => {
        fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
      });
      console.log(`[postinstall] Extracted ${tarSubdir} specs from ${tarballUrl.split('/').pop()}`);
    }
    execSync(`rm -rf "${tmpDir}"`);
  } catch (e) {
    console.warn(`[postinstall] Warning: could not extract specs from ${tarballUrl}: ${e.message}`);
  }
}

const nm = path.join(__dirname, '../node_modules');
// react-native-reanimated: specs + missing android files
extractSpecsFromTarball(
  'https://registry.npmjs.org/react-native-reanimated/-/react-native-reanimated-4.3.1.tgz',
  path.join(nm, 'react-native-reanimated/src/specs'),
  'src/specs',
);
// Also restore missing android files (CMakeLists.txt, AndroidManifest.xml)
(function restoreReanimatedAndroid() {
  const missingFiles = [
    ['android/CMakeLists.txt', 'android/CMakeLists.txt'],
    ['android/src/main/AndroidManifest.xml', 'android/src/main/AndroidManifest.xml'],
  ];
  const baseDir = path.join(nm, 'react-native-reanimated');
  const anyMissing = missingFiles.some(([rel]) => !fs.existsSync(path.join(baseDir, rel)));
  if (!anyMissing) return;
  try {
    const tmpDir = require('os').tmpdir() + '/izi-reanimated-' + Date.now();
    fs.mkdirSync(tmpDir, { recursive: true });
    const { execSync } = require('child_process');
    execSync(
      `curl -sf "https://registry.npmjs.org/react-native-reanimated/-/react-native-reanimated-4.3.1.tgz" | tar -xz -C "${tmpDir}" 2>/dev/null`,
      { shell: '/bin/bash' },
    );
    missingFiles.forEach(([rel, src]) => {
      const dest = path.join(baseDir, rel);
      const source = path.join(tmpDir, 'package', src);
      if (!fs.existsSync(dest) && fs.existsSync(source)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(source, dest);
        console.log(`[postinstall] Restored react-native-reanimated/${rel}`);
      }
    });
    execSync(`rm -rf "${tmpDir}"`);
  } catch (e) {
    console.warn('[postinstall] Warning: could not restore reanimated android files:', e.message);
  }
})();
extractSpecsFromTarball(
  'https://registry.npmjs.org/react-native-svg/-/react-native-svg-15.15.4.tgz',
  path.join(nm, 'react-native-svg/src/fabric'),
  'src/fabric',
);
// Also restore missing src/ files for react-native-svg
// The package.json "react-native" field points to src/index.ts which Metro uses,
// but npm only extracts a subset of files — most of src/ is missing.
(function restoreSvgSrc() {
  const svgBase = path.join(nm, 'react-native-svg');
  if (!fs.existsSync(path.join(svgBase, 'src/index.ts'))) {
    try {
      const tmpDir = require('os').tmpdir() + '/izi-svg-src-' + Date.now();
      fs.mkdirSync(tmpDir, { recursive: true });
      execSync(
        `curl -sf "https://registry.npmjs.org/react-native-svg/-/react-native-svg-15.15.4.tgz" | tar -xz -C "${tmpDir}" 2>/dev/null`,
        { shell: '/bin/bash' },
      );
      const srcInTarball = path.join(tmpDir, 'package/src');
      function copyDirIfMissing(srcDir, destDir) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.readdirSync(srcDir).forEach((entry) => {
          const s = path.join(srcDir, entry);
          const d = path.join(destDir, entry);
          if (fs.statSync(s).isDirectory()) {
            copyDirIfMissing(s, d);
          } else if (!fs.existsSync(d)) {
            fs.copyFileSync(s, d);
          }
        });
      }
      copyDirIfMissing(srcInTarball, path.join(svgBase, 'src'));
      execSync(`rm -rf "${tmpDir}"`);
      console.log('[postinstall] Restored react-native-svg/src/ from tarball');
    } catch (e) {
      console.warn('[postinstall] Warning: could not restore svg src files:', e.message);
    }
  }
})();
// Also restore missing android/src/main/jni files for react-native-svg
(function restoreSvgJni() {
  const svgBase = path.join(nm, 'react-native-svg');
  const missingJni = ['android/src/main/jni/CMakeLists.txt'];
  const anyMissing = missingJni.some((f) => !fs.existsSync(path.join(svgBase, f)));
  if (!anyMissing) return;
  try {
    const tmpDir = require('os').tmpdir() + '/izi-svg-' + Date.now();
    fs.mkdirSync(tmpDir, { recursive: true });
    execSync(
      `curl -sf "https://registry.npmjs.org/react-native-svg/-/react-native-svg-15.15.4.tgz" | tar -xz -C "${tmpDir}" 2>/dev/null`,
      { shell: '/bin/bash' },
    );
    missingJni.forEach((rel) => {
      const dest = path.join(svgBase, rel);
      const src = path.join(tmpDir, 'package', rel);
      if (!fs.existsSync(dest) && fs.existsSync(src)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        console.log(`[postinstall] Restored react-native-svg/${rel}`);
      }
    });
    execSync(`rm -rf "${tmpDir}"`);
  } catch (e) {
    console.warn('[postinstall] Warning: could not restore svg jni files:', e.message);
  }
})();
extractSpecsFromTarball(
  'https://registry.npmjs.org/react-native-gesture-handler/-/react-native-gesture-handler-2.31.2.tgz',
  path.join(nm, 'react-native-gesture-handler/src/specs'),
  'src/specs',
);
// Also restore missing android/src/main/jni files for react-native-gesture-handler
(function restoreGestureHandlerJni() {
  const ghBase = path.join(nm, 'react-native-gesture-handler');
  const missingJni = [
    'android/src/main/jni/CMakeLists.txt',
    'android/src/main/jni/cpp-adapter.cpp',
  ];
  const anyMissing = missingJni.some((f) => !fs.existsSync(path.join(ghBase, f)));
  if (!anyMissing) return;
  try {
    const tmpDir = require('os').tmpdir() + '/izi-gh-' + Date.now();
    fs.mkdirSync(tmpDir, { recursive: true });
    execSync(
      `curl -sf "https://registry.npmjs.org/react-native-gesture-handler/-/react-native-gesture-handler-2.31.2.tgz" | tar -xz -C "${tmpDir}" 2>/dev/null`,
      { shell: '/bin/bash' },
    );
    missingJni.forEach((rel) => {
      const dest = path.join(ghBase, rel);
      const src = path.join(tmpDir, 'package', rel);
      if (!fs.existsSync(dest) && fs.existsSync(src)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        console.log(`[postinstall] Restored react-native-gesture-handler/${rel}`);
      }
    });
    execSync(`rm -rf "${tmpDir}"`);
  } catch (e) {
    console.warn('[postinstall] Warning: could not restore gesture-handler jni files:', e.message);
  }
})();

// Restore missing src/ trees for packages that set "react-native": "src/index[.ts]"
// but omit most of src/ from the npm tarball extraction.
function restoreSrcFromTarball(tarballUrl, pkgBase, sentinel) {
  if (fs.existsSync(path.join(pkgBase, sentinel))) return;
  try {
    const tmpDir = require('os').tmpdir() + '/izi-src-' + Date.now();
    fs.mkdirSync(tmpDir, { recursive: true });
    execSync(`curl -sf "${tarballUrl}" | tar -xz -C "${tmpDir}" 2>/dev/null`, {
      shell: '/bin/bash',
    });
    const srcInTarball = path.join(tmpDir, 'package/src');
    function copyDirIfMissing(s, d) {
      fs.mkdirSync(d, { recursive: true });
      fs.readdirSync(s).forEach((entry) => {
        const ss = path.join(s, entry),
          dd = path.join(d, entry);
        if (fs.statSync(ss).isDirectory()) copyDirIfMissing(ss, dd);
        else if (!fs.existsSync(dd)) fs.copyFileSync(ss, dd);
      });
    }
    copyDirIfMissing(srcInTarball, path.join(pkgBase, 'src'));
    execSync(`rm -rf "${tmpDir}"`);
    console.log(`[postinstall] Restored ${path.basename(pkgBase)}/src/ from tarball`);
  } catch (e) {
    console.warn(
      `[postinstall] Warning: could not restore ${path.basename(pkgBase)}/src/:`,
      e.message,
    );
  }
}
restoreSrcFromTarball(
  'https://registry.npmjs.org/react-native-reanimated/-/react-native-reanimated-4.3.1.tgz',
  path.join(nm, 'react-native-reanimated'),
  'src/index.ts',
);
restoreSrcFromTarball(
  'https://registry.npmjs.org/react-native-gesture-handler/-/react-native-gesture-handler-2.31.2.tgz',
  path.join(nm, 'react-native-gesture-handler'),
  'src/index.ts',
);

// Fix 7: Disable IPO/LTO check in ReactNative-application.cmake
// check_ipo_supported() uses try_compile() which doesn't propagate CMAKE_ANDROID_NDK_VERSION.
// Clang.cmake then defaults to -fuse-ld=gold which fails on Linux ARM cross-compilation.
// LTO is a release performance optimization — not needed for local debug builds.
const rnAppCmake = path.join(
  nm,
  'react-native/ReactAndroid/cmake-utils/ReactNative-application.cmake',
);
if (fs.existsSync(rnAppCmake)) {
  let cmakeContent = fs.readFileSync(rnAppCmake, 'utf8');
  if (
    cmakeContent.includes('check_ipo_supported(RESULT IPO_SUPPORT)') &&
    !cmakeContent.includes('# IPO_DISABLED_LINUX')
  ) {
    cmakeContent = cmakeContent.replace(
      /# If the user toolchain supports IPO, we enable it for the app build\ninclude\(CheckIPOSupported\)\ncheck_ipo_supported\(RESULT IPO_SUPPORT\)\nif \(IPO_SUPPORT\)\n  set\(CMAKE_INTERPROCEDURAL_OPTIMIZATION TRUE\)\nendif\(\)/,
      '# IPO_DISABLED_LINUX: check_ipo_supported fails on Linux/ARM cross-compilation\n' +
        '# (CMake 3.22 + NDK r27 try_compile does not propagate CMAKE_ANDROID_NDK_VERSION,\n' +
        "#  so Clang.cmake defaults to -fuse-ld=gold which the system linker can't use for ARM)\n" +
        '# set(CMAKE_INTERPROCEDURAL_OPTIMIZATION FALSE)',
    );
    fs.writeFileSync(rnAppCmake, cmakeContent);
    console.log('[postinstall] Disabled IPO check in ReactNative-application.cmake');
  }
}
