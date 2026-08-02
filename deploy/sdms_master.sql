-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 29, 2026 at 01:10 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sdms_master`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `resource` varchar(100) NOT NULL,
  `resource_id` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `old_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_data`)),
  `new_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_data`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `status` enum('success','failed') DEFAULT 'success',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `username`, `action`, `resource`, `resource_id`, `description`, `old_data`, `new_data`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES
('040d9bf7-e480-4774-858c-789cc8a2398c', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 14:16:50'),
('04477cb6-ced2-45aa-be10-a6c7da97b433', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 13:31:39'),
('052ab328-9529-488a-9ec0-9f162624752c', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '25a9de1c-47cc-4048-8a60-489fd1123f8f', 'Pegawai Agus Salim dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:28:59'),
('069e27a4-0f1a-4cfb-b847-7837aa4e2328', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'guru', 'a31490c4-4c2f-400f-a2a7-55b0ea2d669b', 'Guru Fitri Handayani, S.Pd dibuat', NULL, '{\"nama\":\"Fitri Handayani, S.Pd\",\"niy\":\"20180004\",\"jenis_kelamin\":\"P\",\"status_kepegawaian\":\"GTT\",\"jabatan\":\"Wali Kelas XII AKL 1\",\"no_hp\":\"081234567008\",\"agama\":\"Islam\",\"jurusan_id\":\"d52075db-0fd9-40ce-8769-3dbd647e592f\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('14c9a5a2-197f-4b9d-bc59-dce3f73fbceb', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '3a59a1b7-5530-4c86-967a-5218f643f043', 'Pegawai Joko Widodo dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:40:45'),
('1f66b020-b4c7-464f-b293-b8da8bfbcebb', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', 'bf9a3b24-a9f2-48fc-a6ee-e382b341e85f', 'Pegawai Yanti Kurniawati dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:28:58'),
('22b9a044-1698-45cd-b17c-81a3e92c6e60', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '246530ec-d172-4e99-b037-8b47bc93cc07', 'Pegawai Eko Susanto dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:40:45'),
('24f1d93e-8755-4bfa-b8ed-c0bca8cf5275', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', 'ca2c3f66-dcc5-4ef8-b61f-ce41c0fe1f70', 'Siswa Nisa Ramadhani dibuat', NULL, '{\"nama\":\"Nisa Ramadhani\",\"nisn\":\"0001234578\",\"nis\":\"2024012\",\"jenis_kelamin\":\"P\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"7dd5f7e7-5593-433b-b2a6-d4325f63230d\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('2525cac5-cb78-4532-9031-e0807ddc4c73', '72b74fd5-830a-4abb-aa0b-0a4313e9ef4a', 'mazjou', 'UPDATE', 'jurusan', '5307bdb6-02a3-4e91-ba5c-8bf9ae7eac93', 'Jurusan BDP diperbarui', NULL, '{\"is_active\":false}', NULL, NULL, 'success', '2026-07-28 22:06:12'),
('2b3554f3-1c7b-49a1-908a-d426bcc6d10d', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'guru', 'b7d82a9d-40e9-4543-8df5-3249b4e9e45d', 'Guru Budi Santoso, S.T dibuat', NULL, '{\"nama\":\"Budi Santoso, S.T\",\"nip\":\"198803152012011003\",\"jenis_kelamin\":\"L\",\"status_kepegawaian\":\"GTY\",\"jabatan\":\"Wali Kelas X TKJ 1\",\"no_hp\":\"081234567003\",\"agama\":\"Islam\",\"jurusan_id\":\"4fa37e5d-6fbb-4c2a-bf33-57fa38e23868\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('2c82c6b4-49d3-4551-9a92-4a694a40664c', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '24ef2373-5337-4f43-964b-e878a1f662f6', 'Pegawai Agus Salim dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:30:10'),
('30881fd2-983a-4b4e-b7db-0888bd7408cd', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', 'b8b8b469-99a8-4afc-874c-c03f1580c9e9', 'Siswa Dika Firmansyah dibuat', NULL, '{\"nama\":\"Dika Firmansyah\",\"nisn\":\"0001234569\",\"nis\":\"2024003\",\"jenis_kelamin\":\"L\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"4fa37e5d-6fbb-4c2a-bf33-57fa38e23868\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('31480cc1-0f4c-4479-bbb2-61481f3fc52e', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGOUT', 'auth', NULL, 'Logout berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 14:07:26'),
('3390a681-af19-4d05-b3b0-1d76ebc2db11', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '6415169e-60cb-42ba-9d7f-0301b847eea7', 'Pegawai Agus Salim dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 14:15:01'),
('3407cbec-587e-439d-91f9-4e4d9a3a319c', '72b74fd5-830a-4abb-aa0b-0a4313e9ef4a', 'mazjou', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 21:48:29'),
('3b833dc1-c060-4560-9af1-bd65f5e133a7', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 14:02:23'),
('416f96fe-4aa0-4fd8-92b4-259c244b95a8', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', 'c9060f39-d38e-48f9-8967-c78c0b83d70c', 'Siswa Indah Permatasari dibuat', NULL, '{\"nama\":\"Indah Permatasari\",\"nisn\":\"0001234574\",\"nis\":\"2024008\",\"jenis_kelamin\":\"P\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"4b16745b-9e64-4b9d-8fcc-3bdcea22ec39\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('41fa57b4-9649-4d6c-a41a-6cdf8badb8df', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 13:27:10'),
('41ffa9f5-c902-4811-ab7b-9e023908187a', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '82c29081-39f6-4a56-9999-0d53b8ed2991', 'Pegawai Joko Widodo dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 14:15:01'),
('46cc8d2b-21de-4206-8bc2-cf56342f992e', '72b74fd5-830a-4abb-aa0b-0a4313e9ef4a', 'mazjou', 'UPDATE', 'jurusan', 'd52075db-0fd9-40ce-8769-3dbd647e592f', 'Jurusan AKL diperbarui (kode: AKL → TPTUP)', NULL, '{\"kode\":\"TPTUP\",\"nama\":\"Teknik Pemanasan, Tata Udara, dan Pendinginan\",\"deskripsi\":\"Jurusan Teknik Ketenagalistrikan\"}', NULL, NULL, 'success', '2026-07-28 22:05:58'),
('4bbe73a3-0df1-40e7-9347-752f158da893', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', 'ef4b6ad1-9eb2-4696-a397-eb5583f6178e', 'Pegawai Eko Susanto dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 14:15:01'),
('50104539-05e0-47f9-8ca6-42a916605a45', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'guru', '2465b661-2474-44e1-a457-60b7e03b4ce4', 'Guru Siti Rahayu, S.Kom dibuat', NULL, '{\"nama\":\"Siti Rahayu, S.Kom\",\"nip\":\"199002032015012002\",\"jenis_kelamin\":\"P\",\"status_kepegawaian\":\"PNS\",\"jabatan\":\"Wakasek Kurikulum\",\"no_hp\":\"081234567002\",\"agama\":\"Islam\",\"jurusan_id\":\"4fa37e5d-6fbb-4c2a-bf33-57fa38e23868\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('52bdad12-8da0-44ea-b06b-19aba51290d2', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', 'd8d68a9b-a79a-48fb-bc73-5eea40ce2590', 'Pegawai Sri Mulyani dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 14:15:01'),
('5646a9e2-aa16-4449-accf-5c7588f2a8d6', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '605af59d-6db9-4983-b936-bba0ddbcadc6', 'Pegawai Joko Widodo dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:28:59'),
('5c286101-f988-44fb-87f0-455874a889ff', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '259f25d2-6351-4dbe-8c5d-0ee4cbc31608', 'Pegawai Sri Mulyani dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:40:45'),
('5fe84ca7-91b5-4b0c-9ffc-04cc3fe40a55', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', '3689bf4c-ac7b-48c6-8a9d-2eb7eff5822f', 'Siswa Citra Dewi dibuat', NULL, '{\"nama\":\"Citra Dewi\",\"nisn\":\"0001234572\",\"nis\":\"2024006\",\"jenis_kelamin\":\"P\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"4b16745b-9e64-4b9d-8fcc-3bdcea22ec39\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('65625c48-6ab0-4200-b7e6-0e96d3c61c75', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '6e0d51e9-3f8d-483f-9e2b-5d625d36cb15', 'Pegawai Sri Mulyani dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:28:59'),
('6ba71100-240c-42a1-add5-ae45b1c39047', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 13:30:10'),
('78b6f484-93ae-4f4a-b4bc-12e8f4b5a7d6', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'users', '72b74fd5-830a-4abb-aa0b-0a4313e9ef4a', 'User mazjou dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 14:06:55'),
('7bc8eee0-178e-4b76-9dca-68e8f0cace89', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '4acd9c35-04ee-4430-a2ec-a91765108f15', 'Pegawai Sri Mulyani dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:30:10'),
('7ca7c004-3e8c-43af-802f-c1a913500c65', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', 'a9a1d0a5-feb5-4cc0-8043-669b858e0a57', 'Siswa Fajar Setiawan dibuat', NULL, '{\"nama\":\"Fajar Setiawan\",\"nisn\":\"0001234577\",\"nis\":\"2024011\",\"jenis_kelamin\":\"L\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"d52075db-0fd9-40ce-8769-3dbd647e592f\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('838086c4-49c4-4a66-80c3-d76ee5d88bdc', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', 'c236521f-9604-49eb-bde7-b586619e6aa3', 'Pegawai Sri Mulyani dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:31:40'),
('88518dd5-bb25-4016-a45a-b89eed934f75', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', '20672bec-dd1e-4ed9-8389-512d842389bf', 'Siswa Sari Wahyuningsih dibuat', NULL, '{\"nama\":\"Sari Wahyuningsih\",\"nisn\":\"0001234570\",\"nis\":\"2024004\",\"jenis_kelamin\":\"P\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"4fa37e5d-6fbb-4c2a-bf33-57fa38e23868\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('8d7c6a90-33e1-48f0-86c4-7497b8a00a7a', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'guru', '160910d5-184c-4ef5-8f2c-f17f86bee49e', 'Guru Dewi Lestari, S.Pd dibuat', NULL, '{\"nama\":\"Dewi Lestari, S.Pd\",\"niy\":\"20150001\",\"jenis_kelamin\":\"P\",\"status_kepegawaian\":\"GTT\",\"jabatan\":\"Guru Matematika\",\"no_hp\":\"081234567004\",\"agama\":\"Islam\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('8e9047a3-1e34-4e7b-824c-23691ba98b53', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', '6a9cf264-a076-49cf-ab10-89d153c30f80', 'Siswa Arif Budiman dibuat', NULL, '{\"nama\":\"Arif Budiman\",\"nisn\":\"0001234579\",\"nis\":\"2024013\",\"jenis_kelamin\":\"L\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"7dd5f7e7-5593-433b-b2a6-d4325f63230d\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('99309dcf-f7a4-467f-aa85-2b83ad717f9e', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 22:57:16'),
('9c58f246-5051-4c92-84d8-9832d24773c0', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'guru', '6459885f-518f-4323-97c6-8a7a51332baf', 'Guru Ahmad Fauzi, S.Pd dibuat', NULL, '{\"nama\":\"Ahmad Fauzi, S.Pd\",\"nip\":\"198501012010011001\",\"jenis_kelamin\":\"L\",\"status_kepegawaian\":\"PNS\",\"jabatan\":\"Kepala Sekolah\",\"no_hp\":\"081234567001\",\"agama\":\"Islam\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('a2c53e9a-6cda-48cf-9dad-c7a1f2fddc02', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', 'e01a75fe-77c9-4019-a7ca-d4accaa786d0', 'Siswa Yoga Pratama dibuat', NULL, '{\"nama\":\"Yoga Pratama\",\"nisn\":\"0001234575\",\"nis\":\"2024009\",\"jenis_kelamin\":\"L\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"d52075db-0fd9-40ce-8769-3dbd647e592f\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('a52bd6b8-7068-477e-8e50-91fac80216e6', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', 'b8c7b516-9bed-4e20-b8b4-b75179c22704', 'Pegawai Yanti Kurniawati dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:40:45'),
('a540896a-183a-4216-8dfc-4dcfe38447ce', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', 'd60a801d-5282-43cb-9ff9-1655c1f737d5', 'Siswa Rizal Maulana dibuat', NULL, '{\"nama\":\"Rizal Maulana\",\"nisn\":\"0001234573\",\"nis\":\"2024007\",\"jenis_kelamin\":\"L\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"4b16745b-9e64-4b9d-8fcc-3bdcea22ec39\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('a8f397a7-82fd-4699-83ba-c400feb0c67f', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 13:28:58'),
('aaebb7b4-c795-46cd-9136-79513cc62293', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'guru', 'ff65fab4-920f-4993-ae8b-6a36952dfdbe', 'Guru Hendra Wijaya, S.Pd dibuat', NULL, '{\"nama\":\"Hendra Wijaya, S.Pd\",\"nip\":\"199105202018011004\",\"jenis_kelamin\":\"L\",\"status_kepegawaian\":\"PPPK\",\"jabatan\":\"Guru Bahasa Indonesia\",\"no_hp\":\"081234567007\",\"agama\":\"Islam\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('ab1d7b2e-4a61-4421-acb5-ef89da7d42d2', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', '6613452c-e465-406c-9158-99d0d2492c86', 'Siswa Rini Oktaviani dibuat', NULL, '{\"nama\":\"Rini Oktaviani\",\"nisn\":\"0001234568\",\"nis\":\"2024002\",\"jenis_kelamin\":\"P\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"4fa37e5d-6fbb-4c2a-bf33-57fa38e23868\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('b11fdb54-c121-4597-8368-d9836591b1d1', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 13:30:26'),
('b4128124-b5c9-45ba-b281-76d5cc9f967c', '72b74fd5-830a-4abb-aa0b-0a4313e9ef4a', 'mazjou', 'UPDATE', 'jurusan', '7dd5f7e7-5593-433b-b2a6-d4325f63230d', 'Jurusan OTKP diperbarui (kode: OTKP → TKR)', NULL, '{\"kode\":\"TKR\",\"nama\":\"Teknik Kendaraan Ringan\",\"deskripsi\":\"Jurusan ottmotif\"}', NULL, NULL, 'success', '2026-07-28 22:03:41'),
('b487bd57-a573-441f-9a02-d67ce3922d5c', '72b74fd5-830a-4abb-aa0b-0a4313e9ef4a', 'mazjou', 'UPDATE', 'jurusan', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', 'Jurusan RPL diperbarui (kode: RPL → KULINER)', NULL, '{\"kode\":\"KULINER\",\"nama\":\"Kuliner\",\"deskripsi\":\"Jurusan Kuliner\"}', NULL, NULL, 'success', '2026-07-28 22:06:30'),
('b992f7a8-18f4-4c03-9756-6fc9cfdcbab5', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 13:40:44'),
('ba4a2899-6390-44fe-b99e-9352b09585e3', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '6d704442-fb9c-4a30-a183-de2688af2948', 'Pegawai Agus Salim dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:40:45'),
('babb1b78-2ff6-41a8-8da7-aefd9e89091c', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 14:15:01'),
('bf315ce4-fc31-4b91-a959-47550a5dd856', '72b74fd5-830a-4abb-aa0b-0a4313e9ef4a', 'mazjou', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 14:08:30'),
('c5095ca8-33a6-4af1-89fc-1e03c26f10d5', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', '422ca511-9deb-4925-93ec-de4b816fc466', 'Siswa Bagas Nugroho dibuat', NULL, '{\"nama\":\"Bagas Nugroho\",\"nisn\":\"0001234571\",\"nis\":\"2024005\",\"jenis_kelamin\":\"L\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"4fa37e5d-6fbb-4c2a-bf33-57fa38e23868\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('c612cd55-671e-440a-890b-e6a43d4731ab', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', 'e36a830f-dd18-46d1-b12c-e2faa4399cfd', 'Pegawai Yanti Kurniawati dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 14:15:01'),
('c9cf63d8-2af4-46d2-821f-4a8ddb1eb4b5', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', '54a73804-6d21-4433-ac9a-fca401242749', 'Siswa Putri Ayu dibuat', NULL, '{\"nama\":\"Putri Ayu\",\"nisn\":\"0001234576\",\"nis\":\"2024010\",\"jenis_kelamin\":\"P\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"d52075db-0fd9-40ce-8769-3dbd647e592f\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('d15cd74b-95f5-49d9-a640-1e42ec7e9e21', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '83d7e17e-9dc0-4698-bd06-374619a561d5', 'Pegawai Joko Widodo dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:31:40'),
('d6cc37f2-a96c-46d2-aeb2-a80676d76a05', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 13:26:52'),
('d96809cb-b850-4914-98d2-3e44cffdb34b', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', 'c1b72e8a-ee17-4735-a27c-3f0c47c637ed', 'Pegawai Agus Salim dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:31:40'),
('e0bac44a-3abd-4e39-b5cb-d9e3a83f2a06', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '38703910-cce0-409a-a66f-a86da3d4b1d8', 'Pegawai Joko Widodo dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:30:10'),
('e65a0c7a-487f-4836-93d4-aba175609435', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 14:05:24'),
('eb656995-4195-491d-8e05-cafe8188f5d5', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'siswa', '3d723d96-3180-4d43-92b5-30e86d588804', 'Siswa Andi Prasetyo dibuat', NULL, '{\"nama\":\"Andi Prasetyo\",\"nisn\":\"0001234567\",\"nis\":\"2024001\",\"jenis_kelamin\":\"L\",\"tahun_masuk\":2024,\"agama\":\"Islam\",\"status\":\"Aktif\",\"jurusan_id\":\"4fa37e5d-6fbb-4c2a-bf33-57fa38e23868\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('f1039b50-5408-4083-a050-b81a74aa2039', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'guru', '39305f79-a558-4905-af11-234a5e8ce8b5', 'Guru Rudi Hartono, S.Kom dibuat', NULL, '{\"nama\":\"Rudi Hartono, S.Kom\",\"niy\":\"20160002\",\"jenis_kelamin\":\"L\",\"status_kepegawaian\":\"GTY\",\"jabatan\":\"Wali Kelas XI RPL 1\",\"no_hp\":\"081234567005\",\"agama\":\"Islam\",\"jurusan_id\":\"4b16745b-9e64-4b9d-8fcc-3bdcea22ec39\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('f4756625-7418-4306-9562-dd6fc3ac2ddf', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'guru', '842b95fc-4224-4ab2-8444-1655dc47ff97', 'Guru Maya Sari, S.E dibuat', NULL, '{\"nama\":\"Maya Sari, S.E\",\"niy\":\"20170003\",\"jenis_kelamin\":\"P\",\"status_kepegawaian\":\"Honor\",\"jabatan\":\"Guru Akuntansi\",\"no_hp\":\"081234567006\",\"agama\":\"Islam\",\"jurusan_id\":\"d52075db-0fd9-40ce-8769-3dbd647e592f\"}', NULL, NULL, 'success', '2026-07-28 13:28:58'),
('f8493c04-2ff5-426d-95a6-cc3dbc17e453', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'CREATE', 'pegawai', '778bae9a-39e8-4c50-8105-b53b5b706576', 'Pegawai Eko Susanto dibuat', NULL, NULL, NULL, NULL, 'success', '2026-07-28 13:28:58'),
('ff0af126-c5ad-4d9f-8b1e-53eb25f09690', 'd3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'LOGIN', 'auth', NULL, 'Login berhasil', NULL, NULL, '::1', NULL, 'success', '2026-07-28 13:26:19');

-- --------------------------------------------------------

--
-- Table structure for table `guru`
--

CREATE TABLE `guru` (
  `id` char(36) NOT NULL,
  `nip` varchar(30) DEFAULT NULL COMMENT 'Nomor Induk Pegawai (NIP ASN) atau NIY (Non-ASN)',
  `niy` varchar(30) DEFAULT NULL COMMENT 'Nomor Induk Yayasan',
  `nama` varchar(200) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `agama` enum('Islam','Kristen','Katolik','Hindu','Buddha','Konghucu') DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `foto` varchar(500) DEFAULT NULL,
  `status_kepegawaian` enum('PNS','PPPK','GTY','GTT','Honor') DEFAULT NULL,
  `jabatan` varchar(100) DEFAULT NULL COMMENT 'Contoh: Wali Kelas, Wakasek Kurikulum, Kepala Sekolah',
  `jurusan_id` char(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guru`
--

INSERT INTO `guru` (`id`, `nip`, `niy`, `nama`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `agama`, `alamat`, `no_hp`, `email`, `foto`, `status_kepegawaian`, `jabatan`, `jurusan_id`, `is_active`, `created_at`, `updated_at`) VALUES
('160910d5-184c-4ef5-8f2c-f17f86bee49e', NULL, '20150001', 'Dewi Lestari, S.Pd', 'P', NULL, NULL, 'Islam', NULL, '081234567004', NULL, NULL, 'GTT', 'Guru Matematika', NULL, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('2465b661-2474-44e1-a457-60b7e03b4ce4', '199002032015012002', NULL, 'Siti Rahayu, S.Kom', 'P', NULL, NULL, 'Islam', NULL, '081234567002', NULL, NULL, 'PNS', 'Wakasek Kurikulum', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('39305f79-a558-4905-af11-234a5e8ce8b5', NULL, '20160002', 'Rudi Hartono, S.Kom', 'L', NULL, NULL, 'Islam', NULL, '081234567005', NULL, NULL, 'GTY', 'Wali Kelas XI RPL 1', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('6459885f-518f-4323-97c6-8a7a51332baf', '198501012010011001', NULL, 'Ahmad Fauzi, S.Pd', 'L', NULL, NULL, 'Islam', NULL, '081234567001', NULL, NULL, 'PNS', 'Kepala Sekolah', NULL, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('842b95fc-4224-4ab2-8444-1655dc47ff97', NULL, '20170003', 'Maya Sari, S.E', 'P', NULL, NULL, 'Islam', NULL, '081234567006', NULL, NULL, 'Honor', 'Guru Akuntansi', 'd52075db-0fd9-40ce-8769-3dbd647e592f', 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('a31490c4-4c2f-400f-a2a7-55b0ea2d669b', NULL, '20180004', 'Fitri Handayani, S.Pd', 'P', NULL, NULL, 'Islam', NULL, '081234567008', NULL, NULL, 'GTT', 'Wali Kelas XII AKL 1', 'd52075db-0fd9-40ce-8769-3dbd647e592f', 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('b7d82a9d-40e9-4543-8df5-3249b4e9e45d', '198803152012011003', NULL, 'Budi Santoso, S.T', 'L', NULL, NULL, 'Islam', NULL, '081234567003', NULL, NULL, 'GTY', 'Wali Kelas X TKJ 1', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('ff65fab4-920f-4993-ae8b-6a36952dfdbe', '199105202018011004', NULL, 'Hendra Wijaya, S.Pd', 'L', NULL, NULL, 'Islam', NULL, '081234567007', NULL, NULL, 'PPPK', 'Guru Bahasa Indonesia', NULL, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58');

-- --------------------------------------------------------

--
-- Table structure for table `jurusan`
--

CREATE TABLE `jurusan` (
  `id` char(36) NOT NULL,
  `kode` varchar(20) NOT NULL COMMENT 'Contoh: TKJ, RPL, AKL',
  `nama` varchar(150) NOT NULL COMMENT 'Contoh: Teknik Komputer dan Jaringan',
  `kepala_jurusan_id` char(36) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jurusan`
--

INSERT INTO `jurusan` (`id`, `kode`, `nama`, `kepala_jurusan_id`, `deskripsi`, `is_active`, `created_at`, `updated_at`) VALUES
('4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', 'KULINER', 'Kuliner', NULL, 'Jurusan Kuliner', 1, '2026-07-28 13:28:58', '2026-07-28 22:06:30'),
('4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', 'TKJ', 'Teknik Komputer dan Jaringan', NULL, 'Jurusan jaringan komputer', 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('5307bdb6-02a3-4e91-ba5c-8bf9ae7eac93', 'BDP', 'Bisnis Daring dan Pemasaran', NULL, 'Jurusan pemasaran', 0, '2026-07-28 13:28:58', '2026-07-28 22:06:12'),
('7dd5f7e7-5593-433b-b2a6-d4325f63230d', 'TKR', 'Teknik Kendaraan Ringan', NULL, 'Jurusan ottmotif', 1, '2026-07-28 13:28:58', '2026-07-28 22:03:41'),
('d52075db-0fd9-40ce-8769-3dbd647e592f', 'TPTUP', 'Teknik Pemanasan, Tata Udara, dan Pendinginan', NULL, 'Jurusan Teknik Ketenagalistrikan', 1, '2026-07-28 13:28:58', '2026-07-28 22:05:58');

-- --------------------------------------------------------

--
-- Table structure for table `kalender_akademik`
--

CREATE TABLE `kalender_akademik` (
  `id` char(36) NOT NULL,
  `tahun_pelajaran_id` char(36) NOT NULL,
  `semester_id` char(36) DEFAULT NULL,
  `judul` varchar(200) NOT NULL COMMENT 'Contoh: UTS Semester Ganjil, Libur Idul Fitri',
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `jenis` enum('libur','ujian','kegiatan','penerimaan','lainnya') DEFAULT 'kegiatan',
  `deskripsi` text DEFAULT NULL,
  `warna` varchar(10) DEFAULT NULL COMMENT 'Hex color untuk kalender UI, contoh: #FF5733',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kalender_akademik`
--

INSERT INTO `kalender_akademik` (`id`, `tahun_pelajaran_id`, `semester_id`, `judul`, `tanggal_mulai`, `tanggal_selesai`, `jenis`, `deskripsi`, `warna`, `created_at`, `updated_at`) VALUES
('012f0986-254b-468c-843a-824748221a9a', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Hari Pertama Masuk Sekolah', '2024-07-15', '2024-07-15', 'kegiatan', NULL, '#10b981', '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('068fcff9-4016-418b-8c85-3bb6944bfdf1', '27bf128c-da98-4cfa-8d41-9c08125e9088', NULL, 'Ulangan Harian 1', '2025-09-01', '2025-09-05', 'ujian', NULL, '#f59e0b', '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('0d327530-9550-44e5-a96a-29f4c31f7d1d', '27bf128c-da98-4cfa-8d41-9c08125e9088', NULL, 'Libur Akhir Tahun Pelajaran', '2026-06-22', '2026-07-12', 'libur', NULL, '#8b5cf6', '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('106e480e-177b-403f-bd52-d561f8308561', '27bf128c-da98-4cfa-8d41-9c08125e9088', NULL, 'Ujian Sekolah', '2026-04-06', '2026-04-17', 'ujian', NULL, '#dc2626', '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('1989e276-a017-4b19-ad5d-e0532a0f4fb4', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Hari Pertama Masuk Sekolah', '2024-07-15', '2024-07-15', 'kegiatan', NULL, '#10b981', '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('1e9ac962-6016-497a-b946-55af275a948f', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penerimaan Peserta Didik Baru', '2025-06-02', '2025-06-14', 'penerimaan', NULL, '#06b6d4', '2026-07-28 13:30:11', '2026-07-28 13:30:11'),
('20a4fefd-fb31-4174-88f0-dc46cd25c3de', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Tengah Semester Genap', '2025-03-10', '2025-03-15', 'ujian', NULL, '#ef4444', '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('28ae304a-1968-45b8-bab4-4f08f5df79ae', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Ujian Sekolah', '2025-04-07', '2025-04-18', 'ujian', NULL, '#dc2626', '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('28d84a03-ce99-4f88-9818-3d62be7a9f2b', '27bf128c-da98-4cfa-8d41-9c08125e9088', NULL, 'Penerimaan Peserta Didik Baru', '2026-06-01', '2026-06-13', 'penerimaan', NULL, '#06b6d4', '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('2adcfc6e-45e4-4595-ac5f-b81aa72c9c4d', '27bf128c-da98-4cfa-8d41-9c08125e9088', NULL, 'Penilaian Akhir Semester Ganjil', '2025-11-24', '2025-11-29', 'ujian', NULL, '#ef4444', '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('2bead9aa-00e6-42d8-8eeb-f3cc532f3304', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penerimaan Peserta Didik Baru', '2025-06-02', '2025-06-14', 'penerimaan', NULL, '#06b6d4', '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('346fee90-f6c8-4cde-afaa-b5fe7d469591', '27bf128c-da98-4cfa-8d41-9c08125e9088', NULL, 'Masa Pengenalan Lingkungan Sekolah', '2025-07-14', '2025-07-16', 'kegiatan', NULL, '#3b82f6', '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('3504b6ea-0225-43c6-8a64-a92a8f044e6c', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Ulangan Harian 1', '2024-09-02', '2024-09-06', 'ujian', NULL, '#f59e0b', '2026-07-28 13:30:11', '2026-07-28 13:30:11'),
('402a9405-84b9-4f50-af27-f3189505903d', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Hari Pertama Semester Genap', '2025-01-06', '2025-01-06', 'kegiatan', NULL, '#10b981', '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('412a3283-f374-4d4e-8dd6-d8e5015119b1', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Masa Pengenalan Lingkungan Sekolah', '2024-07-15', '2024-07-17', 'kegiatan', NULL, '#3b82f6', '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('4aa82f1e-6ecf-4509-8087-786a40b84b35', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Libur Semester Ganjil', '2024-12-23', '2025-01-05', 'libur', NULL, '#8b5cf6', '2026-07-28 13:30:11', '2026-07-28 13:30:11'),
('4c08c483-079a-467e-8317-c1baa3c7173d', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Libur Semester Ganjil', '2024-12-23', '2025-01-05', 'libur', NULL, '#8b5cf6', '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('4f6af735-31ff-4093-b0bf-c6088ec0e070', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penerimaan Peserta Didik Baru', '2025-06-02', '2025-06-14', 'penerimaan', NULL, '#06b6d4', '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('587b4c85-1437-4e1c-bfb8-9110150fc4e0', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Masa Pengenalan Lingkungan Sekolah', '2024-07-15', '2024-07-17', 'kegiatan', NULL, '#3b82f6', '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('5a48815f-40fa-485d-917e-f69b87b00f2f', '27bf128c-da98-4cfa-8d41-9c08125e9088', NULL, 'Hari Pertama Semester Genap', '2026-01-05', '2026-01-05', 'kegiatan', NULL, '#10b981', '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('62f26509-4ded-4925-b081-f101cbfce7fb', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Tengah Semester Genap', '2025-03-10', '2025-03-15', 'ujian', NULL, '#ef4444', '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('7990338c-7cdb-4bc3-a5f9-24eb023e2ff8', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Ulangan Harian 1', '2024-09-02', '2024-09-06', 'ujian', NULL, '#f59e0b', '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('7fa05381-4144-42c3-aa5d-a9919ab69db5', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Hari Pertama Masuk Sekolah', '2024-07-15', '2024-07-15', 'kegiatan', NULL, '#10b981', '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('816816fd-3b0c-4f4a-ac7a-1bd9e6896de1', '27bf128c-da98-4cfa-8d41-9c08125e9088', NULL, 'Libur Semester Ganjil', '2025-12-22', '2026-01-04', 'libur', NULL, '#8b5cf6', '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('83b0ab97-c52f-4fac-9761-0c1061dcdf1a', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Masa Pengenalan Lingkungan Sekolah', '2024-07-15', '2024-07-17', 'kegiatan', NULL, '#3b82f6', '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('8671c8f5-003a-4986-819e-c014426a0d5e', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Akhir Semester Ganjil', '2024-11-25', '2024-11-30', 'ujian', NULL, '#ef4444', '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('926e8978-f09d-4cea-a4e1-ff5fbe40e01e', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Tengah Semester Ganjil', '2024-10-07', '2024-10-12', 'ujian', NULL, '#ef4444', '2026-07-28 13:30:11', '2026-07-28 13:30:11'),
('9673b0be-6299-483d-8d83-2c406065920a', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Libur Akhir Tahun Pelajaran', '2025-06-23', '2025-07-13', 'libur', NULL, '#8b5cf6', '2026-07-28 13:30:11', '2026-07-28 13:30:11'),
('9cf35226-b4bd-41f4-b645-7944ff6a940d', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penerimaan Peserta Didik Baru', '2025-06-02', '2025-06-14', 'penerimaan', NULL, '#06b6d4', '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('9f281872-81e6-4dac-9f07-0c126f938116', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Ujian Sekolah', '2025-04-07', '2025-04-18', 'ujian', NULL, '#dc2626', '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('a5414d3e-52fa-449c-ae3b-ad0aeb2e7ad7', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Hari Pertama Masuk Sekolah', '2024-07-15', '2024-07-15', 'kegiatan', NULL, '#10b981', '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('a6b0d1e2-f533-4523-b714-123396dac474', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Tengah Semester Genap', '2025-03-10', '2025-03-15', 'ujian', NULL, '#ef4444', '2026-07-28 13:30:11', '2026-07-28 13:30:11'),
('a82c382b-52c2-417b-9d18-ea1769ab531b', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Akhir Semester Ganjil', '2024-11-25', '2024-11-30', 'ujian', NULL, '#ef4444', '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('a86b22d2-740e-433f-90d7-90456c203554', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Ulangan Harian 1', '2024-09-02', '2024-09-06', 'ujian', NULL, '#f59e0b', '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('aba31986-3139-4674-8711-28af3acbce04', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Masa Pengenalan Lingkungan Sekolah', '2024-07-15', '2024-07-17', 'kegiatan', NULL, '#3b82f6', '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('acb88604-1cb6-4f0c-9611-146445cb9976', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Libur Akhir Tahun Pelajaran', '2025-06-23', '2025-07-13', 'libur', NULL, '#8b5cf6', '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('b055e0b4-1ba8-4410-9c28-cdd781253704', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Ulangan Harian 1', '2024-09-02', '2024-09-06', 'ujian', NULL, '#f59e0b', '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('b667ddd3-b1b5-441c-85aa-e7d079e18402', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Tengah Semester Ganjil', '2024-10-07', '2024-10-12', 'ujian', NULL, '#ef4444', '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('b782eec7-4c5e-4c99-8fa6-b3acb2cbb788', '27bf128c-da98-4cfa-8d41-9c08125e9088', NULL, 'Penilaian Tengah Semester Genap', '2026-03-09', '2026-03-14', 'ujian', NULL, '#ef4444', '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('b8933cc1-17c5-4beb-b32b-116c90ba9650', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Tengah Semester Ganjil', '2024-10-07', '2024-10-12', 'ujian', NULL, '#ef4444', '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('c187c508-e13d-499a-83ee-d0e7695bd629', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Libur Semester Ganjil', '2024-12-23', '2025-01-05', 'libur', NULL, '#8b5cf6', '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('c4a668ea-077f-4063-b9dd-e925ec8344e1', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Tengah Semester Ganjil', '2024-10-07', '2024-10-12', 'ujian', NULL, '#ef4444', '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('c91602c9-1e8e-4324-8211-ef806a55e2f1', '27bf128c-da98-4cfa-8d41-9c08125e9088', NULL, 'Hari Pertama Masuk Sekolah', '2025-07-14', '2025-07-14', 'kegiatan', NULL, '#10b981', '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('c922e09b-34f9-4a58-aad3-1b813e24f86b', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Libur Akhir Tahun Pelajaran', '2025-06-23', '2025-07-13', 'libur', NULL, '#8b5cf6', '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('cb510fa8-c428-4dfd-9f9d-21f7a6250893', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Libur Akhir Tahun Pelajaran', '2025-06-23', '2025-07-13', 'libur', NULL, '#8b5cf6', '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('cd38bad0-8af9-4da4-9763-c3357b972ae3', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Hari Pertama Semester Genap', '2025-01-06', '2025-01-06', 'kegiatan', NULL, '#10b981', '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('cf3a49b4-b78f-4dde-a0ff-0bb285131131', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Hari Pertama Semester Genap', '2025-01-06', '2025-01-06', 'kegiatan', NULL, '#10b981', '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('d5035a7f-3664-46ee-aab7-2b9287af54ae', '27bf128c-da98-4cfa-8d41-9c08125e9088', NULL, 'Penilaian Tengah Semester Ganjil', '2025-10-06', '2025-10-11', 'ujian', NULL, '#ef4444', '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('d51f95a0-7d8b-4533-85f4-d424a37183e1', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Ujian Sekolah', '2025-04-07', '2025-04-18', 'ujian', NULL, '#dc2626', '2026-07-28 13:30:11', '2026-07-28 13:30:11'),
('dafce01a-c39a-4f5a-828f-1e3b2d847428', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Akhir Semester Ganjil', '2024-11-25', '2024-11-30', 'ujian', NULL, '#ef4444', '2026-07-28 13:30:11', '2026-07-28 13:30:11'),
('e049e162-5cba-4caf-aca2-b359d80b30fe', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Tengah Semester Genap', '2025-03-10', '2025-03-15', 'ujian', NULL, '#ef4444', '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('e0e405c5-c634-4d05-bac7-43b7a340804a', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Hari Pertama Semester Genap', '2025-01-06', '2025-01-06', 'kegiatan', NULL, '#10b981', '2026-07-28 13:30:11', '2026-07-28 13:30:11'),
('ef41442f-2c6a-4697-bcec-0929aba4b0bb', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Libur Semester Ganjil', '2024-12-23', '2025-01-05', 'libur', NULL, '#8b5cf6', '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('f585f337-19f4-4e96-9238-0ccb305366db', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Ujian Sekolah', '2025-04-07', '2025-04-18', 'ujian', NULL, '#dc2626', '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('f616e5b2-1e00-4361-b53b-3d9e2bf737e6', '5b54df8d-3d1c-435d-808b-36bbd580b352', NULL, 'Penilaian Akhir Semester Ganjil', '2024-11-25', '2024-11-30', 'ujian', NULL, '#ef4444', '2026-07-28 13:40:45', '2026-07-28 13:40:45');

-- --------------------------------------------------------

--
-- Table structure for table `kelas`
--

CREATE TABLE `kelas` (
  `id` char(36) NOT NULL,
  `nama` varchar(50) NOT NULL COMMENT 'Contoh: X TKJ 1, XI RPL 2',
  `tingkat` enum('X','XI','XII') NOT NULL,
  `jurusan_id` char(36) DEFAULT NULL,
  `wali_kelas_id` char(36) DEFAULT NULL,
  `tahun_pelajaran_id` char(36) NOT NULL,
  `kapasitas` int(11) DEFAULT 36,
  `ruangan` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kelas`
--

INSERT INTO `kelas` (`id`, `nama`, `tingkat`, `jurusan_id`, `wali_kelas_id`, `tahun_pelajaran_id`, `kapasitas`, `ruangan`, `is_active`, `created_at`, `updated_at`) VALUES
('053c6f16-1fdd-4605-a798-18ffed0624e2', 'XII AKL 1', 'XII', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:40:44', '2026-07-28 13:40:44'),
('11b11d68-f94c-4223-96a8-6d4b24747084', 'X RPL 1', 'X', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '27bf128c-da98-4cfa-8d41-9c08125e9088', 36, NULL, 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('1637a4eb-80a2-4076-b1c3-b332665ebb50', 'XI TKJ 1', 'XI', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:40:44', '2026-07-28 13:40:44'),
('25057363-b945-4ed7-9360-b3484ffce5ec', 'XII AKL 1', 'XII', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('26217546-9dbf-40ea-ae0c-a6a781d302d9', 'XI RPL 1', 'XI', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('2b1412b9-6a13-4650-a9e4-c6f2264daff7', 'XII TKJ 1', 'XII', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('2f584761-0fd0-45e7-b145-3796d61541b4', 'XI AKL 1', 'XI', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('32428a79-3fa7-4de8-8972-30194b194d10', 'X TKJ 2', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:26', '2026-07-28 13:30:26'),
('466ea300-c3ee-4e60-8180-fdb10b31ca6e', 'XII TKJ 1', 'XII', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('4dfc562a-1317-4c5e-8fc4-d3b4c7452a9f', 'XII TKJ 1', 'XII', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:26', '2026-07-28 13:30:26'),
('4f9e1532-b2e3-4b55-8bb1-1580281a22fb', 'X RPL 1', 'X', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('522a897e-62e3-4eed-93fc-de2925443c7f', 'X TKJ 1', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '27bf128c-da98-4cfa-8d41-9c08125e9088', 36, NULL, 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('52a679e7-4a8e-429c-8ac6-5333022605d4', 'XII AKL 1', 'XII', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '27bf128c-da98-4cfa-8d41-9c08125e9088', 36, NULL, 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('560db4a6-3e7d-4f4f-a678-1cf2dcf20b23', 'XII TKJ 1', 'XII', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '27bf128c-da98-4cfa-8d41-9c08125e9088', 36, NULL, 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('5b7b3475-4df1-4fe5-bd2c-32a33c864ad9', 'XI TKJ 1', 'XI', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('5f463f73-1251-47d1-ae1c-ec9660053362', 'X RPL 1', 'X', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('63227b2d-455b-4c42-baf5-f56cd9e8890c', 'X RPL 1', 'X', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('653863ba-62f6-40f7-8841-bbedc0a30b12', 'X RPL 1', 'X', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:40:44', '2026-07-28 13:40:44'),
('6e510e4f-6626-4e73-8ea6-60d2c69f76c5', 'XI RPL 1', 'XI', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:26', '2026-07-28 13:30:26'),
('7052160f-4cae-4dab-8b5d-53d1a9226bc4', 'XII AKL 1', 'XII', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:26', '2026-07-28 13:30:26'),
('7629b1d1-87ec-4840-8898-cdb064de3ab4', 'X TKJ 2', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('7c4b400e-3cfc-4f7c-945a-5783debc6514', 'X TKJ 1', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('7c911bb3-393f-49da-9995-9f3829a6d637', 'X TKJ 1', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('7e667a37-282d-4461-a263-6252b91ce44d', 'XI RPL 1', 'XI', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '27bf128c-da98-4cfa-8d41-9c08125e9088', 36, NULL, 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('814fc8e4-963c-47cd-8884-769ba4048cce', 'XI TKJ 1', 'XI', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('826292b7-bc23-4dff-8882-7d05ede1c1f1', 'X RPL 1', 'X', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:26', '2026-07-28 13:30:26'),
('8d8032b1-d502-4e76-9f41-6fe78a8d3fb0', 'XI TKJ 1', 'XI', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('8dd690d3-0224-4d9c-a0cb-65bcd8154a45', 'XI TKJ 1', 'XI', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '27bf128c-da98-4cfa-8d41-9c08125e9088', 36, NULL, 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('988efc61-dcfc-4ce7-a67a-9ebd47eef55e', 'X TKJ 2', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('99744373-cd42-40ab-b4c0-eadd881b588c', 'X TKJ 2', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('a4d1b3f9-b762-4ef3-b5e4-41228530c313', 'XII TKJ 1', 'XII', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:40:44', '2026-07-28 13:40:44'),
('b6a29709-0718-4157-ab63-25a9b7411952', 'X TKJ 1', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:26', '2026-07-28 13:30:26'),
('b77d6486-11b6-41c8-8bca-971e88a696ee', 'XI TKJ 1', 'XI', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:26', '2026-07-28 13:30:26'),
('b8392af2-903f-460e-a309-103aac0213a5', 'XI RPL 1', 'XI', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('bb583823-a303-47c1-9649-c01ecf34a8da', 'X TKJ 2', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '27bf128c-da98-4cfa-8d41-9c08125e9088', 36, NULL, 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('bc4f5b77-5c99-4e7e-be9b-fe3b72786490', 'XII TKJ 1', 'XII', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('c3710200-2b2a-4ad4-bd5f-c067c82b632e', 'XII AKL 1', 'XII', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('c4c8e740-dbf2-4183-9757-c4060790a530', 'X TKJ 1', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('cebd0d05-a8c5-4c37-9f21-874d27710f08', 'XI RPL 1', 'XI', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:40:44', '2026-07-28 13:40:44'),
('d33532b3-4b1d-4974-abe2-4294492a5e53', 'XI AKL 1', 'XI', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('d745b4cf-922c-4acd-945e-087083a86b2d', 'XI AKL 1', 'XI', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:40:44', '2026-07-28 13:40:44'),
('d7515f8c-7148-4932-8a51-5eed071980ac', 'XI AKL 1', 'XI', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('e29fff67-4567-490a-96b9-33566de4420a', 'XI AKL 1', 'XI', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '27bf128c-da98-4cfa-8d41-9c08125e9088', 36, NULL, 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('e5120e0f-b51e-41f2-bdf9-0ec28f52938d', 'XI AKL 1', 'XI', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:30:26', '2026-07-28 13:30:26'),
('f9446f04-3150-4a5f-8c6d-bcc11125079f', 'X TKJ 2', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:40:44', '2026-07-28 13:40:44'),
('fa0754d7-cd38-4844-a58b-f9442bb8ae17', 'X TKJ 1', 'X', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:40:44', '2026-07-28 13:40:44'),
('fa25ae9b-52f8-4c17-aba0-14d92f234149', 'XI RPL 1', 'XI', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('fd41aad5-d103-49b6-aaf2-2db181420e7b', 'XII AKL 1', 'XII', 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, '5b54df8d-3d1c-435d-808b-36bbd580b352', 36, NULL, 1, '2026-07-28 13:31:40', '2026-07-28 13:31:40');

-- --------------------------------------------------------

--
-- Table structure for table `mata_pelajaran`
--

CREATE TABLE `mata_pelajaran` (
  `id` char(36) NOT NULL,
  `kode` varchar(20) NOT NULL COMMENT 'Contoh: MAT, IND, PKK-TKJ',
  `nama` varchar(150) NOT NULL COMMENT 'Contoh: Matematika, Bahasa Indonesia',
  `kelompok` enum('A','B','C','Muatan Lokal','Pengembangan Diri') DEFAULT NULL COMMENT 'Kelompok mata pelajaran sesuai kurikulum',
  `jurusan_id` char(36) DEFAULT NULL COMMENT 'NULL jika mapel umum (semua jurusan)',
  `jam_per_minggu` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mata_pelajaran`
--

INSERT INTO `mata_pelajaran` (`id`, `kode`, `nama`, `kelompok`, `jurusan_id`, `jam_per_minggu`, `is_active`, `created_at`, `updated_at`) VALUES
('158c7cc6-69d6-4f7c-b2f4-c1fd642f64fd', 'MAT', 'Matematika', 'A', NULL, 4, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('7ca81f55-0f67-4df5-840c-a608cba0e553', 'IND', 'Bahasa Indonesia', 'A', NULL, 4, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('7d044361-1729-48a1-83ad-07ce3237a8f7', 'PKK-TKJ', 'Prod. Kreatif TKJ', 'C', '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', 7, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('88169c37-4225-4d50-a55a-c6c1f115e0da', 'SENBUD', 'Seni Budaya', 'B', NULL, 2, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('88b59221-5f42-47e9-b6aa-f86a48541972', 'PAI', 'Pendidikan Agama Islam', 'A', NULL, 3, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('9b2a9d52-f8e2-417b-a6e8-58deed413ecd', 'PKK-AKL', 'Prod. Kreatif AKL', 'C', 'd52075db-0fd9-40ce-8769-3dbd647e592f', 7, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('cded13e1-9191-4317-9fb2-368dabd7ef2d', 'PKN', 'Pendidikan Pancasila', 'A', NULL, 2, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('e77620ab-ae51-4336-a3f6-da7f5efcc31f', 'PKK-RPL', 'Prod. Kreatif RPL', 'C', '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', 7, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('f5f118ea-6cc1-4414-a417-ce5aabf4092c', 'PJOK', 'Penjasorkes', 'B', NULL, 2, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('fd6b22e1-ebad-463f-90ef-f07256917fae', 'ING', 'Bahasa Inggris', 'A', NULL, 3, 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58');

-- --------------------------------------------------------

--
-- Table structure for table `orang_tua`
--

CREATE TABLE `orang_tua` (
  `id` char(36) NOT NULL,
  `nama_ayah` varchar(200) DEFAULT NULL,
  `nama_ibu` varchar(200) DEFAULT NULL,
  `nama_wali` varchar(200) DEFAULT NULL COMMENT 'Diisi jika wali bukan ayah/ibu',
  `pekerjaan_ayah` varchar(100) DEFAULT NULL,
  `pekerjaan_ibu` varchar(100) DEFAULT NULL,
  `no_hp_ayah` varchar(20) DEFAULT NULL,
  `no_hp_ibu` varchar(20) DEFAULT NULL,
  `no_hp_wali` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `penghasilan_ayah` decimal(15,2) DEFAULT NULL,
  `penghasilan_ibu` decimal(15,2) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pegawai`
--

CREATE TABLE `pegawai` (
  `id` char(36) NOT NULL,
  `nip` varchar(30) DEFAULT NULL,
  `nama` varchar(200) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `agama` enum('Islam','Kristen','Katolik','Hindu','Buddha','Konghucu') DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `foto` varchar(500) DEFAULT NULL,
  `jabatan` varchar(100) DEFAULT NULL COMMENT 'Contoh: Staf TU, Bendahara, Kepala TU',
  `unit_kerja` varchar(100) DEFAULT NULL,
  `status_kepegawaian` enum('PNS','PPPK','PTY','PTT','Honor') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pegawai`
--

INSERT INTO `pegawai` (`id`, `nip`, `nama`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `agama`, `alamat`, `no_hp`, `email`, `foto`, `jabatan`, `unit_kerja`, `status_kepegawaian`, `is_active`, `created_at`, `updated_at`) VALUES
('246530ec-d172-4e99-b037-8b47bc93cc07', NULL, 'Eko Susanto', 'L', NULL, NULL, NULL, NULL, '081234568001', NULL, NULL, 'Kepala TU', 'Tata Usaha', 'PNS', 1, '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('24ef2373-5337-4f43-964b-e878a1f662f6', NULL, 'Agus Salim', 'L', NULL, NULL, NULL, NULL, '081234568005', NULL, NULL, 'Staf Perpustakaan', 'Perpustakaan', 'Honor', 1, '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('259f25d2-6351-4dbe-8c5d-0ee4cbc31608', NULL, 'Sri Mulyani', 'P', NULL, NULL, NULL, NULL, '081234568004', NULL, NULL, 'Bendahara', 'Keuangan', 'PTY', 1, '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('25a9de1c-47cc-4048-8a60-489fd1123f8f', NULL, 'Agus Salim', 'L', NULL, NULL, NULL, NULL, '081234568005', NULL, NULL, 'Staf Perpustakaan', 'Perpustakaan', 'Honor', 1, '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('38703910-cce0-409a-a66f-a86da3d4b1d8', NULL, 'Joko Widodo', 'L', NULL, NULL, NULL, NULL, '081234568003', NULL, NULL, 'Penjaga Sekolah', 'Keamanan', 'Honor', 1, '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('3a59a1b7-5530-4c86-967a-5218f643f043', NULL, 'Joko Widodo', 'L', NULL, NULL, NULL, NULL, '081234568003', NULL, NULL, 'Penjaga Sekolah', 'Keamanan', 'Honor', 1, '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('4acd9c35-04ee-4430-a2ec-a91765108f15', NULL, 'Sri Mulyani', 'P', NULL, NULL, NULL, NULL, '081234568004', NULL, NULL, 'Bendahara', 'Keuangan', 'PTY', 1, '2026-07-28 13:30:10', '2026-07-28 13:30:10'),
('605af59d-6db9-4983-b936-bba0ddbcadc6', NULL, 'Joko Widodo', 'L', NULL, NULL, NULL, NULL, '081234568003', NULL, NULL, 'Penjaga Sekolah', 'Keamanan', 'Honor', 1, '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('6415169e-60cb-42ba-9d7f-0301b847eea7', NULL, 'Agus Salim', 'L', NULL, NULL, NULL, NULL, '081234568005', NULL, NULL, 'Staf Perpustakaan', 'Perpustakaan', 'Honor', 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('6d704442-fb9c-4a30-a183-de2688af2948', NULL, 'Agus Salim', 'L', NULL, NULL, NULL, NULL, '081234568005', NULL, NULL, 'Staf Perpustakaan', 'Perpustakaan', 'Honor', 1, '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('6e0d51e9-3f8d-483f-9e2b-5d625d36cb15', NULL, 'Sri Mulyani', 'P', NULL, NULL, NULL, NULL, '081234568004', NULL, NULL, 'Bendahara', 'Keuangan', 'PTY', 1, '2026-07-28 13:28:59', '2026-07-28 13:28:59'),
('778bae9a-39e8-4c50-8105-b53b5b706576', '199001012015011001', 'Eko Susanto', 'L', NULL, NULL, NULL, NULL, '081234568001', NULL, NULL, 'Kepala TU', 'Tata Usaha', 'PNS', 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('82c29081-39f6-4a56-9999-0d53b8ed2991', NULL, 'Joko Widodo', 'L', NULL, NULL, NULL, NULL, '081234568003', NULL, NULL, 'Penjaga Sekolah', 'Keamanan', 'Honor', 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('83d7e17e-9dc0-4698-bd06-374619a561d5', NULL, 'Joko Widodo', 'L', NULL, NULL, NULL, NULL, '081234568003', NULL, NULL, 'Penjaga Sekolah', 'Keamanan', 'Honor', 1, '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('b8c7b516-9bed-4e20-b8b4-b75179c22704', NULL, 'Yanti Kurniawati', 'P', NULL, NULL, NULL, NULL, '081234568002', NULL, NULL, 'Staf Administrasi', 'Tata Usaha', 'PPPK', 1, '2026-07-28 13:40:45', '2026-07-28 13:40:45'),
('bf9a3b24-a9f2-48fc-a6ee-e382b341e85f', '199205032018012002', 'Yanti Kurniawati', 'P', NULL, NULL, NULL, NULL, '081234568002', NULL, NULL, 'Staf Administrasi', 'Tata Usaha', 'PPPK', 1, '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('c1b72e8a-ee17-4735-a27c-3f0c47c637ed', NULL, 'Agus Salim', 'L', NULL, NULL, NULL, NULL, '081234568005', NULL, NULL, 'Staf Perpustakaan', 'Perpustakaan', 'Honor', 1, '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('c236521f-9604-49eb-bde7-b586619e6aa3', NULL, 'Sri Mulyani', 'P', NULL, NULL, NULL, NULL, '081234568004', NULL, NULL, 'Bendahara', 'Keuangan', 'PTY', 1, '2026-07-28 13:31:40', '2026-07-28 13:31:40'),
('d8d68a9b-a79a-48fb-bc73-5eea40ce2590', NULL, 'Sri Mulyani', 'P', NULL, NULL, NULL, NULL, '081234568004', NULL, NULL, 'Bendahara', 'Keuangan', 'PTY', 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('e36a830f-dd18-46d1-b12c-e2faa4399cfd', NULL, 'Yanti Kurniawati', 'P', NULL, NULL, NULL, NULL, '081234568002', NULL, NULL, 'Staf Administrasi', 'Tata Usaha', 'PPPK', 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('ef4b6ad1-9eb2-4696-a397-eb5583f6178e', NULL, 'Eko Susanto', 'L', NULL, NULL, NULL, NULL, '081234568001', NULL, NULL, 'Kepala TU', 'Tata Usaha', 'PNS', 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'Format: resource:action, contoh: siswa:create, guru:delete',
  `label` varchar(150) NOT NULL COMMENT 'Label tampilan, contoh: Tambah Data Siswa',
  `group` varchar(50) DEFAULT NULL COMMENT 'Grup permission, contoh: master_data, lms, jurnal',
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `label`, `group`, `description`, `created_at`, `updated_at`) VALUES
('1141564e-25f5-4814-a40a-d472a07ea85a', 'role:manage', 'Kelola Role & Permission', 'user_management', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('1ada4e10-d70b-4db7-9600-4663c3d24833', 'audit:view', 'Lihat Audit Log', 'system', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('20591468-26c9-4502-8c80-5b42f59587c6', 'user:view', 'Lihat Data User', 'user_management', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('3851fcc8-2c1d-498f-8dc0-90308b10178e', 'dashboard:analytics', 'Lihat Analitik', 'dashboard', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('40e82d68-a105-4f7b-acdb-d3883867b515', 'jurnal:access', 'Akses Jurnal Guru', 'apps', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('42d51ab7-3a3b-4b6d-8019-012fc1298ee7', 'kelas:delete', 'Hapus Data Kelas', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('48668db5-388c-49f6-b433-9564d1317d04', 'kelas:create', 'Tambah Data Kelas', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('5063f83c-9cca-4a3a-bcbc-5e35cce6a152', 'mapel:view', 'Lihat Data Mapel', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('52ac1d85-096d-4c36-976c-03ca259f1274', 'pegawai:delete', 'Hapus Data Pegawai', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('541116c7-8f2f-4ccc-90c6-b93c841c307c', 'guru:delete', 'Hapus Data Guru', 'master_data', NULL, '2026-07-28 13:01:41', '2026-07-28 13:01:41'),
('5a61f95b-0d06-4c5b-a6dd-4585296e52f9', 'mapel:update', 'Ubah Data Mapel', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('642c7039-d120-476f-96eb-ad7666ee5cf9', 'guru:create', 'Tambah Data Guru', 'master_data', NULL, '2026-07-28 13:01:41', '2026-07-28 13:01:41'),
('679b7f3e-4bc6-4982-85e0-74060fd63cff', 'piket:access', 'Akses Piket', 'apps', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('6ce7d5ea-7c15-48f6-9dbb-8c737cfb0edd', 'user:update', 'Ubah User', 'user_management', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('81b29833-fea6-45de-b6e7-16b73f7d2f04', 'jurusan:create', 'Tambah Data Jurusan', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('825f069a-bcc8-424b-9df5-f9b5d6e67714', 'mapel:create', 'Tambah Data Mapel', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('87183540-4151-4253-a092-c780fc5deb51', 'jurusan:update', 'Ubah Data Jurusan', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('904fac19-8c3b-4f6a-878c-7635aa9fd9de', 'user:create', 'Tambah User', 'user_management', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('9c8ad392-99a1-4e78-9fc8-1ab314fe8cdb', 'user:delete', 'Hapus User', 'user_management', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('a548d426-f82a-4eb1-952b-a5424df9fe8f', 'siswa:update', 'Ubah Data Siswa', 'master_data', NULL, '2026-07-28 13:01:41', '2026-07-28 13:01:41'),
('ab7bb586-5c02-454d-ab5c-10b727cbe6c3', 'jurusan:delete', 'Hapus Data Jurusan', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('b794680a-8323-42d6-b37d-21d9767cb44e', 'pegawai:create', 'Tambah Data Pegawai', 'master_data', NULL, '2026-07-28 13:01:41', '2026-07-28 13:01:41'),
('bb6efbae-2894-4e07-b86b-e66c798beccc', 'siswa:create', 'Tambah Data Siswa', 'master_data', NULL, '2026-07-28 13:01:41', '2026-07-28 13:01:41'),
('bf8aad24-4a8b-4d5f-94e6-290a565cf788', 'master:view', 'Lihat Master Data', 'master_data', NULL, '2026-07-28 13:01:41', '2026-07-28 13:01:41'),
('c361b431-0e81-40a6-bd49-3e181bfc9a9b', 'pegawai:update', 'Ubah Data Pegawai', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('c69a888a-ce6b-45b1-b7da-dbc98ef030fd', 'guru:update', 'Ubah Data Guru', 'master_data', NULL, '2026-07-28 13:01:41', '2026-07-28 13:01:41'),
('d4d52cc3-535a-4619-b654-7619c81ebd18', 'jurusan:view', 'Lihat Data Jurusan', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('df050a5d-a7e6-4871-8f5e-7113f42a5069', 'lms:access', 'Akses LMS', 'apps', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('e22f86be-7086-4f6f-9859-be3512a7ecd4', 'guru:view', 'Lihat Data Guru', 'master_data', NULL, '2026-07-28 13:01:41', '2026-07-28 13:01:41'),
('e6d3cec9-4c64-4505-ab25-3cccc195818f', 'sholat:access', 'Akses Absensi Sholat', 'apps', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('e6f7285e-cd32-478b-b315-42e604c9e426', 'siswa:delete', 'Hapus Data Siswa', 'master_data', NULL, '2026-07-28 13:01:41', '2026-07-28 13:01:41'),
('e8727b33-6393-4327-80e4-b127aad2d034', 'pegawai:view', 'Lihat Data Pegawai', 'master_data', NULL, '2026-07-28 13:01:41', '2026-07-28 13:01:41'),
('e8a7fc15-55d1-4cf9-a645-37407eb76113', 'kelas:view', 'Lihat Data Kelas', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('eb35a91c-46ec-4331-bf58-88c2b63d2f7d', 'mapel:delete', 'Hapus Data Mapel', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('eb43f85a-3919-4158-99ff-fc84c9d10403', 'website:access', 'Akses Website Sekolah', 'apps', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('ee8e5a63-7cad-4a91-868c-0f4d3d2e0386', 'siswa:view', 'Lihat Data Siswa', 'master_data', NULL, '2026-07-28 13:01:41', '2026-07-28 13:01:41'),
('f1acec92-724d-4f9c-a1d6-1170756d860f', 'kegiatan:access', 'Akses Kegiatan Sekolah', 'apps', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('fb7ec968-03f1-42ea-b7e9-f2034c9b5dc9', 'kelulusan:access', 'Akses Kelulusan', 'apps', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('ff7f20cd-e39f-44af-b6db-17aae6ecb534', 'dashboard:view', 'Akses Dashboard', 'dashboard', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('fff3daa5-4e53-43dd-9071-d61c265744a8', 'kelas:update', 'Ubah Data Kelas', 'master_data', NULL, '2026-07-28 13:01:42', '2026-07-28 13:01:42');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` char(36) NOT NULL,
  `name` varchar(50) NOT NULL COMMENT 'Contoh: super_admin, admin, guru, pegawai, siswa',
  `label` varchar(100) NOT NULL COMMENT 'Label tampilan, contoh: Super Administrator',
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `label`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
('4bed8052-7e19-47bb-a506-774b3210491a', 'siswa', 'Siswa', 'Akses LMS dan informasi akademik', 1, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('801ddbc0-5d89-451a-8642-3b86c54e46c3', 'super_admin', 'Super Administrator', 'Akses penuh ke seluruh sistem', 1, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('d1147291-39b6-46e7-9aec-213c6dbb8718', 'admin', 'Administrator', 'Kelola data master dan user', 1, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('d26534a3-310e-497d-bfdb-d31002ae9803', 'pegawai', 'Pegawai TU', 'Akses data siswa dan administrasi', 1, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('d50ad5c6-37f0-4288-af88-b8767210f04f', 'guru', 'Guru', 'Akses modul pembelajaran dan jurnal', 1, '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('ffcaf202-8b6b-4a65-af90-cc85c22ee2a9', 'operator', 'Operator', 'Input data absensi dan piket', 1, '2026-07-28 13:01:42', '2026-07-28 13:01:42');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` char(36) NOT NULL,
  `role_id` char(36) NOT NULL,
  `permission_id` char(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `created_at`, `updated_at`) VALUES
('05eb978a-9420-4319-a863-611a06224e93', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'e8a7fc15-55d1-4cf9-a645-37407eb76113', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('08a91b7a-694b-4740-bacf-4dcfd1602339', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '825f069a-bcc8-424b-9df5-f9b5d6e67714', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('0da47db4-974f-4b64-b01a-594f85426421', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'eb43f85a-3919-4158-99ff-fc84c9d10403', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('17b50251-835d-4134-80ee-084f97d782ff', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '40e82d68-a105-4f7b-acdb-d3883867b515', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('17faed40-9c75-4f89-a9ee-59c19d2ebeab', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'e6f7285e-cd32-478b-b315-42e604c9e426', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('190a9a1f-5b4e-4f81-81c7-72e04ac19f69', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'f1acec92-724d-4f9c-a1d6-1170756d860f', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('1b1e2909-e489-4e7d-8d09-07e4de9ddf5c', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'd4d52cc3-535a-4619-b654-7619c81ebd18', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('1c7a7a9f-aa48-4385-836d-c94a15064bbe', 'd26534a3-310e-497d-bfdb-d31002ae9803', 'e8a7fc15-55d1-4cf9-a645-37407eb76113', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('20a51fb5-4d6d-489e-acdc-935db546502f', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'fb7ec968-03f1-42ea-b7e9-f2034c9b5dc9', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('26b888d0-7b28-4501-86a9-60293580f0cc', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'e8727b33-6393-4327-80e4-b127aad2d034', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('29d6f35c-0de3-4c1b-8eba-43515850cf06', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'c69a888a-ce6b-45b1-b7da-dbc98ef030fd', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('2d23627d-71f7-4242-8f0c-a5f654184b2c', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'e8a7fc15-55d1-4cf9-a645-37407eb76113', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('2e5c12a3-f969-4792-95c0-a43e46f7d0b9', 'd50ad5c6-37f0-4288-af88-b8767210f04f', 'f1acec92-724d-4f9c-a1d6-1170756d860f', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('2ef47ef5-8b42-4cb4-97dd-d367f4993f4b', 'd1147291-39b6-46e7-9aec-213c6dbb8718', '6ce7d5ea-7c15-48f6-9dbb-8c737cfb0edd', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('31981331-2490-447a-b0fc-8d27f351c34c', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '9c8ad392-99a1-4e78-9fc8-1ab314fe8cdb', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('327c46ff-505f-4ab2-aca4-2b277a34db5a', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'bf8aad24-4a8b-4d5f-94e6-290a565cf788', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('3a81ae33-da6e-4481-9987-37b9113a1a40', 'd1147291-39b6-46e7-9aec-213c6dbb8718', '40e82d68-a105-4f7b-acdb-d3883867b515', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('3c01eaac-a260-4e0b-ae78-3332a2068b30', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'df050a5d-a7e6-4871-8f5e-7113f42a5069', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('3cab3072-cd8c-491a-a6a0-9810736f4be2', 'd1147291-39b6-46e7-9aec-213c6dbb8718', '3851fcc8-2c1d-498f-8dc0-90308b10178e', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('3e349294-d59b-4fc4-ae1d-aefd2a345b3b', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'bb6efbae-2894-4e07-b86b-e66c798beccc', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('407ea180-b3ac-4d5d-9970-3c79e45aef5f', 'd1147291-39b6-46e7-9aec-213c6dbb8718', '20591468-26c9-4502-8c80-5b42f59587c6', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('40b7fbda-10a9-45bc-afba-362d3798f454', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '48668db5-388c-49f6-b433-9564d1317d04', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('43ac8766-5d7e-4476-853c-f91d7416cd49', 'd26534a3-310e-497d-bfdb-d31002ae9803', 'e22f86be-7086-4f6f-9859-be3512a7ecd4', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('444d7444-08e0-4083-932b-dec25125c383', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '52ac1d85-096d-4c36-976c-03ca259f1274', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('46caa345-4db5-467d-b1b7-46b9fcf89f80', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'bf8aad24-4a8b-4d5f-94e6-290a565cf788', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('4849f3e3-9b6b-41b8-b8a2-85888e30fe60', 'd26534a3-310e-497d-bfdb-d31002ae9803', 'e6d3cec9-4c64-4505-ab25-3cccc195818f', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('4a510dc3-0479-43c8-85ce-9359713c2c52', 'd26534a3-310e-497d-bfdb-d31002ae9803', '679b7f3e-4bc6-4982-85e0-74060fd63cff', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('4ba1e511-4c36-4c8d-9aa7-f0deddfa5196', 'd50ad5c6-37f0-4288-af88-b8767210f04f', 'ee8e5a63-7cad-4a91-868c-0f4d3d2e0386', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('4d98b935-7902-4f92-b025-9dcfcd759545', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'bb6efbae-2894-4e07-b86b-e66c798beccc', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('4e4128a6-6944-474a-8200-4c2f3a20de17', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'fb7ec968-03f1-42ea-b7e9-f2034c9b5dc9', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('521cba51-1045-44c3-a2fa-5f97234fba91', 'ffcaf202-8b6b-4a65-af90-cc85c22ee2a9', 'e8a7fc15-55d1-4cf9-a645-37407eb76113', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('5234e594-55d5-43eb-b79d-3f92a0ad213f', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'e22f86be-7086-4f6f-9859-be3512a7ecd4', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('5663bf15-5e45-4804-b7b8-b3f41e8ad83d', 'd1147291-39b6-46e7-9aec-213c6dbb8718', '48668db5-388c-49f6-b433-9564d1317d04', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('5e3dead4-9056-468c-bcdd-2216f2ec2a52', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '904fac19-8c3b-4f6a-878c-7635aa9fd9de', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('5f9f8dda-ded7-4d56-a2af-735f5d3a86e0', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'd4d52cc3-535a-4619-b654-7619c81ebd18', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('658822fc-8053-46b4-b75b-39af0105db44', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '642c7039-d120-476f-96eb-ad7666ee5cf9', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('65a6245d-c7e3-41d5-bde7-da3e9d63e5ec', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'c361b431-0e81-40a6-bd49-3e181bfc9a9b', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('67cbbfb1-5f49-4a66-9247-cbeba6b39f4a', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'b794680a-8323-42d6-b37d-21d9767cb44e', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('6bcfbaa9-36a4-431e-8180-fc178ad53ac3', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '679b7f3e-4bc6-4982-85e0-74060fd63cff', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('7a24b191-e6e3-46fc-a932-64068b77dfaf', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'ff7f20cd-e39f-44af-b6db-17aae6ecb534', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('7afa89ae-20dc-43f0-b227-ba775e810fa3', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '81b29833-fea6-45de-b6e7-16b73f7d2f04', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('80158cd2-fd6e-4c27-9d59-da499a0bef2b', 'd26534a3-310e-497d-bfdb-d31002ae9803', 'f1acec92-724d-4f9c-a1d6-1170756d860f', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('842526b4-6919-4827-9189-dd10d8f65ccd', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '5063f83c-9cca-4a3a-bcbc-5e35cce6a152', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('84cf2089-927f-4f70-85ab-1845244238c6', 'd1147291-39b6-46e7-9aec-213c6dbb8718', '5063f83c-9cca-4a3a-bcbc-5e35cce6a152', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('8999ae68-6f4c-4432-b640-cd0dfa84dc45', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'ff7f20cd-e39f-44af-b6db-17aae6ecb534', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('8a77bc16-6687-4121-9717-c30dd5b481ed', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'e6d3cec9-4c64-4505-ab25-3cccc195818f', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('8b041b86-8966-4659-979b-2dac73188746', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'df050a5d-a7e6-4871-8f5e-7113f42a5069', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('8bfee1f7-cbf6-4ca9-a6c4-04d8f676d331', 'd50ad5c6-37f0-4288-af88-b8767210f04f', 'e8a7fc15-55d1-4cf9-a645-37407eb76113', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('905ec309-be53-4096-b8e9-8e014606e01d', 'ffcaf202-8b6b-4a65-af90-cc85c22ee2a9', 'ff7f20cd-e39f-44af-b6db-17aae6ecb534', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('90c8a59e-4dea-4720-af6f-5dc4fe18bfb7', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '1ada4e10-d70b-4db7-9600-4663c3d24833', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('911ca5c8-8c27-45a3-9314-abfb7de51576', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'f1acec92-724d-4f9c-a1d6-1170756d860f', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('91491fa3-1a11-4a5b-84da-ca81f046694f', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'c69a888a-ce6b-45b1-b7da-dbc98ef030fd', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('9209a498-610d-4332-8d79-930d521c0382', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'eb35a91c-46ec-4331-bf58-88c2b63d2f7d', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('96902360-4282-4fdf-852e-c0ec2215e36b', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '42d51ab7-3a3b-4b6d-8019-012fc1298ee7', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('9c45cf87-1dc5-4290-a826-93dcd210f1cf', 'd1147291-39b6-46e7-9aec-213c6dbb8718', '904fac19-8c3b-4f6a-878c-7635aa9fd9de', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('9d5cbd0a-7575-4718-8c7d-389298331611', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'fff3daa5-4e53-43dd-9071-d61c265744a8', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('9f849350-1690-4e41-a633-bda2e162ac3f', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '5a61f95b-0d06-4c5b-a6dd-4585296e52f9', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('a7cf891f-5937-4ba9-b025-66b0ddada6b5', '4bed8052-7e19-47bb-a506-774b3210491a', 'ff7f20cd-e39f-44af-b6db-17aae6ecb534', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('a8b2547a-c73b-4e2b-b7b2-5b07f3d40107', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'eb43f85a-3919-4158-99ff-fc84c9d10403', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('a8d5c9cc-85b1-4a02-9014-f7617087a6be', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'e6d3cec9-4c64-4505-ab25-3cccc195818f', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('aa23e773-22a6-4cf5-bc9b-d223f5e27ad4', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'e8727b33-6393-4327-80e4-b127aad2d034', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('ac61ef9a-0748-4676-9b19-4fc941fa580c', 'd26534a3-310e-497d-bfdb-d31002ae9803', 'fb7ec968-03f1-42ea-b7e9-f2034c9b5dc9', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('aeaa3b58-bf05-400c-a22e-d6ee10b51ea3', 'd50ad5c6-37f0-4288-af88-b8767210f04f', '679b7f3e-4bc6-4982-85e0-74060fd63cff', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('b0a21244-608b-4d1a-8f8c-04a5a455126d', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '1141564e-25f5-4814-a40a-d472a07ea85a', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('b0deb1bc-6a08-414f-b7ec-53a33adaf6a2', 'd50ad5c6-37f0-4288-af88-b8767210f04f', '40e82d68-a105-4f7b-acdb-d3883867b515', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('b1166af4-2e02-4ff1-a5b6-e73d19ba61c0', 'ffcaf202-8b6b-4a65-af90-cc85c22ee2a9', '679b7f3e-4bc6-4982-85e0-74060fd63cff', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('bc8736a2-1420-40db-a824-93adeef1cbb4', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '541116c7-8f2f-4ccc-90c6-b93c841c307c', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('bd7d3563-d1d0-4c07-bd40-e6cd5ff12892', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'ee8e5a63-7cad-4a91-868c-0f4d3d2e0386', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('c092ef7d-4cdb-422e-bf67-d387b186767e', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'fff3daa5-4e53-43dd-9071-d61c265744a8', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('c0d33730-7ed9-4963-a045-38ebded61d47', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'ee8e5a63-7cad-4a91-868c-0f4d3d2e0386', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('c772572b-4023-44bf-8944-c0c530724bb9', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'a548d426-f82a-4eb1-952b-a5424df9fe8f', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('d0035192-c0ce-4cff-83a5-09b355f6f498', 'd1147291-39b6-46e7-9aec-213c6dbb8718', 'c361b431-0e81-40a6-bd49-3e181bfc9a9b', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('d1c18dd5-319b-4231-b055-31946a7c74ba', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '87183540-4151-4253-a092-c780fc5deb51', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('d34acf94-6765-4bf3-9ef8-5060388e89a6', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '6ce7d5ea-7c15-48f6-9dbb-8c737cfb0edd', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('d3be285e-f27c-4912-815f-ff32b6e7574e', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'a548d426-f82a-4eb1-952b-a5424df9fe8f', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('d3de938c-f4fa-4391-9e2d-7bdd5874ff2b', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '20591468-26c9-4502-8c80-5b42f59587c6', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('d47a549b-928c-4280-9e71-05b640142829', '4bed8052-7e19-47bb-a506-774b3210491a', 'df050a5d-a7e6-4871-8f5e-7113f42a5069', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('d64a10c6-ad61-419b-b185-496d262c7767', 'ffcaf202-8b6b-4a65-af90-cc85c22ee2a9', 'ee8e5a63-7cad-4a91-868c-0f4d3d2e0386', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('da5adfc8-0f72-410d-ae76-6c3f378fc3cc', '801ddbc0-5d89-451a-8642-3b86c54e46c3', '3851fcc8-2c1d-498f-8dc0-90308b10178e', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('e175bc96-5847-468b-9f9b-3ee8d2030e77', 'd1147291-39b6-46e7-9aec-213c6dbb8718', '679b7f3e-4bc6-4982-85e0-74060fd63cff', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('e4de325d-dbcf-475a-8f6a-f60a6af53bc7', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'ab7bb586-5c02-454d-ab5c-10b727cbe6c3', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('e87651e2-d9f5-4aa5-ae83-6870654b547c', 'ffcaf202-8b6b-4a65-af90-cc85c22ee2a9', 'e6d3cec9-4c64-4505-ab25-3cccc195818f', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('eb70a298-932d-45f1-b1d4-045552d42516', 'd50ad5c6-37f0-4288-af88-b8767210f04f', 'df050a5d-a7e6-4871-8f5e-7113f42a5069', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('ed351f67-f7e0-4e5e-a711-f29629ba61f0', 'd26534a3-310e-497d-bfdb-d31002ae9803', 'ee8e5a63-7cad-4a91-868c-0f4d3d2e0386', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('eda1f8c7-7ff5-4297-85df-026746caa94f', 'd50ad5c6-37f0-4288-af88-b8767210f04f', 'ff7f20cd-e39f-44af-b6db-17aae6ecb534', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('eef23929-1640-4d01-b171-776fcdbd53a2', 'd26534a3-310e-497d-bfdb-d31002ae9803', 'ff7f20cd-e39f-44af-b6db-17aae6ecb534', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('f6a433a0-4981-434a-baf2-2e72386053d2', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'b794680a-8323-42d6-b37d-21d9767cb44e', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('f7cca747-fc8d-4d67-ab84-09168ef077ad', 'd1147291-39b6-46e7-9aec-213c6dbb8718', '642c7039-d120-476f-96eb-ad7666ee5cf9', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('fa814182-5aeb-48aa-bf00-8d2fa61cf06f', '801ddbc0-5d89-451a-8642-3b86c54e46c3', 'e22f86be-7086-4f6f-9859-be3512a7ecd4', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('fd44d476-1a49-4ccf-8959-abeef088b083', 'ffcaf202-8b6b-4a65-af90-cc85c22ee2a9', 'e22f86be-7086-4f6f-9859-be3512a7ecd4', '2026-07-28 13:01:42', '2026-07-28 13:01:42'),
('fd83024c-fe1a-4239-b8e1-f4e034bb5acd', 'd50ad5c6-37f0-4288-af88-b8767210f04f', 'e6d3cec9-4c64-4505-ab25-3cccc195818f', '2026-07-28 13:01:42', '2026-07-28 13:01:42');

-- --------------------------------------------------------

--
-- Table structure for table `semester`
--

CREATE TABLE `semester` (
  `id` char(36) NOT NULL,
  `tahun_pelajaran_id` char(36) NOT NULL,
  `nama` enum('Ganjil','Genap') NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `is_aktif` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `semester`
--

INSERT INTO `semester` (`id`, `tahun_pelajaran_id`, `nama`, `tanggal_mulai`, `tanggal_selesai`, `is_aktif`, `created_at`, `updated_at`) VALUES
('013a9a63-6aa1-4319-9502-b77efcb41bad', '5b54df8d-3d1c-435d-808b-36bbd580b352', 'Ganjil', '2024-07-15', '2024-12-31', 0, '2026-07-28 13:28:58', '2026-07-28 13:40:44'),
('0a0fa75a-44ef-47ab-959c-38b62f097702', '5b54df8d-3d1c-435d-808b-36bbd580b352', 'Ganjil', '2024-07-15', '2024-12-31', 0, '2026-07-28 13:31:39', '2026-07-28 13:40:44'),
('2ccc6367-9c7a-409f-879f-59bdb33aad60', '5b54df8d-3d1c-435d-808b-36bbd580b352', 'Genap', '2025-01-06', '2025-06-20', 0, '2026-07-28 13:30:26', '2026-07-28 13:40:44'),
('2d03f025-1150-45d7-a58c-4408f3406db6', '27bf128c-da98-4cfa-8d41-9c08125e9088', 'Genap', '2025-01-06', '2025-06-20', 0, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('4d9ee5fe-ae0e-4fbe-a5c6-5fc0c34faa68', '5b54df8d-3d1c-435d-808b-36bbd580b352', 'Genap', '2025-01-06', '2025-06-20', 0, '2026-07-28 13:30:10', '2026-07-28 13:40:44'),
('5ec7f88a-9441-4b8e-a68f-ea748f6a761e', '5b54df8d-3d1c-435d-808b-36bbd580b352', 'Ganjil', '2024-07-15', '2024-12-31', 0, '2026-07-28 13:30:26', '2026-07-28 13:40:44'),
('6da5bc99-0edd-43ed-9c46-52ad98005bf8', '5b54df8d-3d1c-435d-808b-36bbd580b352', 'Genap', '2025-01-06', '2025-06-20', 0, '2026-07-28 13:31:39', '2026-07-28 13:40:44'),
('b4ad5697-a0a3-48f9-933c-4cf7ef23d846', '27bf128c-da98-4cfa-8d41-9c08125e9088', 'Ganjil', '2024-07-15', '2024-12-31', 1, '2026-07-28 14:15:01', '2026-07-28 14:15:01'),
('c42144fa-e417-4736-97f1-ab5cba75f36d', '5b54df8d-3d1c-435d-808b-36bbd580b352', 'Ganjil', '2024-07-15', '2024-12-31', 0, '2026-07-28 13:30:10', '2026-07-28 13:40:44'),
('d632b38e-3ccd-4655-8e64-0b3e6ee3362d', '5b54df8d-3d1c-435d-808b-36bbd580b352', 'Genap', '2025-01-06', '2025-06-20', 0, '2026-07-28 13:28:58', '2026-07-28 13:40:44'),
('e3b4e9ce-3b91-4716-bc33-2301dd6f617d', '5b54df8d-3d1c-435d-808b-36bbd580b352', 'Genap', '2025-01-06', '2025-06-20', 0, '2026-07-28 13:40:44', '2026-07-28 13:40:44'),
('e4b3b915-3216-4d43-96cc-1da1ee8a05cf', '5b54df8d-3d1c-435d-808b-36bbd580b352', 'Ganjil', '2024-07-15', '2024-12-31', 1, '2026-07-28 13:40:44', '2026-07-28 13:40:44');

-- --------------------------------------------------------

--
-- Table structure for table `siswa`
--

CREATE TABLE `siswa` (
  `id` char(36) NOT NULL,
  `nisn` varchar(20) DEFAULT NULL COMMENT 'Nomor Induk Siswa Nasional',
  `nis` varchar(20) DEFAULT NULL COMMENT 'Nomor Induk Siswa (internal sekolah)',
  `nama` varchar(200) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `agama` enum('Islam','Kristen','Katolik','Hindu','Buddha','Konghucu') DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `foto` varchar(500) DEFAULT NULL,
  `jurusan_id` char(36) DEFAULT NULL,
  `orang_tua_id` char(36) DEFAULT NULL,
  `tahun_masuk` int(11) DEFAULT NULL COMMENT 'Tahun masuk sekolah, contoh: 2022',
  `status` enum('Aktif','Lulus','Pindah','Keluar','Meninggal') DEFAULT 'Aktif',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `siswa`
--

INSERT INTO `siswa` (`id`, `nisn`, `nis`, `nama`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `agama`, `alamat`, `no_hp`, `email`, `foto`, `jurusan_id`, `orang_tua_id`, `tahun_masuk`, `status`, `created_at`, `updated_at`) VALUES
('20672bec-dd1e-4ed9-8389-512d842389bf', '0001234570', '2024004', 'Sari Wahyuningsih', 'P', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('3689bf4c-ac7b-48c6-8a9d-2eb7eff5822f', '0001234572', '2024006', 'Citra Dewi', 'P', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('3d723d96-3180-4d43-92b5-30e86d588804', '0001234567', '2024001', 'Andi Prasetyo', 'L', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('422ca511-9deb-4925-93ec-de4b816fc466', '0001234571', '2024005', 'Bagas Nugroho', 'L', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('54a73804-6d21-4433-ac9a-fca401242749', '0001234576', '2024010', 'Putri Ayu', 'P', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('6613452c-e465-406c-9158-99d0d2492c86', '0001234568', '2024002', 'Rini Oktaviani', 'P', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('6a9cf264-a076-49cf-ab10-89d153c30f80', '0001234579', '2024013', 'Arif Budiman', 'L', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, '7dd5f7e7-5593-433b-b2a6-d4325f63230d', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('a9a1d0a5-feb5-4cc0-8043-669b858e0a57', '0001234577', '2024011', 'Fajar Setiawan', 'L', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('b8b8b469-99a8-4afc-874c-c03f1580c9e9', '0001234569', '2024003', 'Dika Firmansyah', 'L', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, '4fa37e5d-6fbb-4c2a-bf33-57fa38e23868', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('c9060f39-d38e-48f9-8967-c78c0b83d70c', '0001234574', '2024008', 'Indah Permatasari', 'P', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('ca2c3f66-dcc5-4ef8-b61f-ce41c0fe1f70', '0001234578', '2024012', 'Nisa Ramadhani', 'P', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, '7dd5f7e7-5593-433b-b2a6-d4325f63230d', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('d60a801d-5282-43cb-9ff9-1655c1f737d5', '0001234573', '2024007', 'Rizal Maulana', 'L', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, '4b16745b-9e64-4b9d-8fcc-3bdcea22ec39', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58'),
('e01a75fe-77c9-4019-a7ca-d4accaa786d0', '0001234575', '2024009', 'Yoga Pratama', 'L', NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, 'd52075db-0fd9-40ce-8769-3dbd647e592f', NULL, 2024, 'Aktif', '2026-07-28 13:28:58', '2026-07-28 13:28:58');

-- --------------------------------------------------------

--
-- Table structure for table `siswa_kelas`
--

CREATE TABLE `siswa_kelas` (
  `id` char(36) NOT NULL,
  `siswa_id` char(36) NOT NULL,
  `kelas_id` char(36) NOT NULL,
  `tahun_pelajaran_id` char(36) NOT NULL,
  `semester_id` char(36) DEFAULT NULL,
  `nomor_absen` int(11) DEFAULT NULL,
  `is_aktif` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tahun_pelajaran`
--

CREATE TABLE `tahun_pelajaran` (
  `id` char(36) NOT NULL,
  `nama` varchar(20) NOT NULL COMMENT 'Contoh: 2024/2025',
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `is_aktif` tinyint(1) DEFAULT 0 COMMENT 'Hanya satu tahun pelajaran yang aktif',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tahun_pelajaran`
--

INSERT INTO `tahun_pelajaran` (`id`, `nama`, `tanggal_mulai`, `tanggal_selesai`, `is_aktif`, `created_at`, `updated_at`) VALUES
('27bf128c-da98-4cfa-8d41-9c08125e9088', '2025/2026', '2025-07-14', '2026-06-30', 1, '2026-07-28 14:15:01', '2026-07-28 14:16:50'),
('5b54df8d-3d1c-435d-808b-36bbd580b352', '2024/2025', '2024-07-15', '2025-06-30', 0, '2026-07-28 13:28:58', '2026-07-28 14:16:50');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `role_id` char(36) NOT NULL,
  `guru_id` char(36) DEFAULT NULL,
  `siswa_id` char(36) DEFAULT NULL,
  `pegawai_id` char(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `avatar`, `role_id`, `guru_id`, `siswa_id`, `pegawai_id`, `is_active`, `last_login_at`, `refresh_token`, `password_changed_at`, `created_at`, `updated_at`) VALUES
('72b74fd5-830a-4abb-aa0b-0a4313e9ef4a', 'mazjou', 'mazjou@gmail.com', '$2a$12$i57Op3DuSsa4U/LRThZkYuyORZgVuUr5Vklcisb7nBbOVXvEknsE.', 'MAZJOU', NULL, '801ddbc0-5d89-451a-8642-3b86c54e46c3', NULL, NULL, NULL, 1, '2026-07-28 21:48:29', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyYjc0ZmQ1LTgzMGEtNGFiYi1hYTBiLTBhNDMxM2U5ZWY0YSIsImlhdCI6MTc4NTI3NTMwOSwiZXhwIjoxNzg1ODgwMTA5fQ.nN6G-SgMw1-UCZOvoNeQtG1my3qNNizNjOSY-T8qZCA', NULL, '2026-07-28 14:06:55', '2026-07-28 21:48:29'),
('d3406be6-a7dc-4c46-ae6c-08f3aa60d1a5', 'superadmin', 'admin@sekolah.sch.id', '$2a$12$2UmWXTf2K5J6wkrfecTL6ekVSmP2EKFfY2YCGXgfgzv24z6RN0NIe', 'Super Administrator SDMS', NULL, '801ddbc0-5d89-451a-8642-3b86c54e46c3', NULL, NULL, NULL, 1, '2026-07-28 22:57:16', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQzNDA2YmU2LWE3ZGMtNGM0Ni1hZTZjLTA4ZjNhYTYwZDFhNSIsImlhdCI6MTc4NTI3OTQzNiwiZXhwIjoxNzg1ODg0MjM2fQ.Mv7RkCcjbrrEUOR4O6QEpBhasxDvjpYzsIlq-yyeKBs', NULL, '2026-07-28 13:01:42', '2026-07-28 22:57:16');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id` (`user_id`),
  ADD KEY `audit_logs_resource` (`resource`),
  ADD KEY `audit_logs_created_at` (`created_at`);

--
-- Indexes for table `guru`
--
ALTER TABLE `guru`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`),
  ADD UNIQUE KEY `niy` (`niy`),
  ADD UNIQUE KEY `nip_2` (`nip`),
  ADD UNIQUE KEY `niy_2` (`niy`),
  ADD UNIQUE KEY `nip_3` (`nip`),
  ADD UNIQUE KEY `niy_3` (`niy`),
  ADD UNIQUE KEY `nip_4` (`nip`),
  ADD UNIQUE KEY `niy_4` (`niy`),
  ADD UNIQUE KEY `nip_5` (`nip`),
  ADD UNIQUE KEY `niy_5` (`niy`),
  ADD UNIQUE KEY `nip_6` (`nip`),
  ADD UNIQUE KEY `niy_6` (`niy`),
  ADD UNIQUE KEY `nip_7` (`nip`),
  ADD UNIQUE KEY `niy_7` (`niy`),
  ADD UNIQUE KEY `nip_8` (`nip`),
  ADD UNIQUE KEY `niy_8` (`niy`),
  ADD UNIQUE KEY `nip_9` (`nip`),
  ADD UNIQUE KEY `niy_9` (`niy`),
  ADD UNIQUE KEY `nip_10` (`nip`),
  ADD UNIQUE KEY `niy_10` (`niy`),
  ADD UNIQUE KEY `nip_11` (`nip`),
  ADD UNIQUE KEY `niy_11` (`niy`),
  ADD UNIQUE KEY `nip_12` (`nip`),
  ADD UNIQUE KEY `niy_12` (`niy`),
  ADD UNIQUE KEY `nip_13` (`nip`),
  ADD UNIQUE KEY `niy_13` (`niy`),
  ADD UNIQUE KEY `nip_14` (`nip`),
  ADD UNIQUE KEY `niy_14` (`niy`),
  ADD UNIQUE KEY `nip_15` (`nip`),
  ADD UNIQUE KEY `niy_15` (`niy`),
  ADD UNIQUE KEY `nip_16` (`nip`),
  ADD UNIQUE KEY `niy_16` (`niy`),
  ADD UNIQUE KEY `nip_17` (`nip`),
  ADD UNIQUE KEY `niy_17` (`niy`),
  ADD UNIQUE KEY `nip_18` (`nip`),
  ADD UNIQUE KEY `niy_18` (`niy`),
  ADD UNIQUE KEY `nip_19` (`nip`),
  ADD UNIQUE KEY `niy_19` (`niy`),
  ADD UNIQUE KEY `nip_20` (`nip`),
  ADD UNIQUE KEY `niy_20` (`niy`),
  ADD UNIQUE KEY `nip_21` (`nip`),
  ADD UNIQUE KEY `niy_21` (`niy`),
  ADD UNIQUE KEY `nip_22` (`nip`),
  ADD UNIQUE KEY `niy_22` (`niy`),
  ADD UNIQUE KEY `nip_23` (`nip`),
  ADD UNIQUE KEY `niy_23` (`niy`),
  ADD UNIQUE KEY `nip_24` (`nip`),
  ADD UNIQUE KEY `niy_24` (`niy`),
  ADD UNIQUE KEY `nip_25` (`nip`),
  ADD UNIQUE KEY `niy_25` (`niy`),
  ADD KEY `guru_nama` (`nama`),
  ADD KEY `guru_is_active` (`is_active`),
  ADD KEY `jurusan_id` (`jurusan_id`);

--
-- Indexes for table `jurusan`
--
ALTER TABLE `jurusan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`),
  ADD UNIQUE KEY `kode_2` (`kode`),
  ADD UNIQUE KEY `kode_3` (`kode`),
  ADD UNIQUE KEY `kode_4` (`kode`),
  ADD UNIQUE KEY `kode_5` (`kode`),
  ADD UNIQUE KEY `kode_6` (`kode`),
  ADD UNIQUE KEY `kode_7` (`kode`),
  ADD UNIQUE KEY `kode_8` (`kode`),
  ADD UNIQUE KEY `kode_9` (`kode`),
  ADD UNIQUE KEY `kode_10` (`kode`),
  ADD UNIQUE KEY `kode_11` (`kode`),
  ADD UNIQUE KEY `kode_12` (`kode`),
  ADD UNIQUE KEY `kode_13` (`kode`),
  ADD UNIQUE KEY `kode_14` (`kode`),
  ADD UNIQUE KEY `kode_15` (`kode`),
  ADD UNIQUE KEY `kode_16` (`kode`),
  ADD UNIQUE KEY `kode_17` (`kode`),
  ADD UNIQUE KEY `kode_18` (`kode`),
  ADD UNIQUE KEY `kode_19` (`kode`),
  ADD UNIQUE KEY `kode_20` (`kode`),
  ADD UNIQUE KEY `kode_21` (`kode`),
  ADD UNIQUE KEY `kode_22` (`kode`),
  ADD UNIQUE KEY `kode_23` (`kode`),
  ADD UNIQUE KEY `kode_24` (`kode`),
  ADD UNIQUE KEY `kode_25` (`kode`),
  ADD KEY `kepala_jurusan_id` (`kepala_jurusan_id`);

--
-- Indexes for table `kalender_akademik`
--
ALTER TABLE `kalender_akademik`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kalender_akademik_tahun_pelajaran_id` (`tahun_pelajaran_id`),
  ADD KEY `kalender_akademik_tanggal_mulai` (`tanggal_mulai`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kelas_tahun_pelajaran_id` (`tahun_pelajaran_id`),
  ADD KEY `kelas_jurusan_id` (`jurusan_id`),
  ADD KEY `wali_kelas_id` (`wali_kelas_id`);

--
-- Indexes for table `mata_pelajaran`
--
ALTER TABLE `mata_pelajaran`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`),
  ADD UNIQUE KEY `kode_2` (`kode`),
  ADD UNIQUE KEY `kode_3` (`kode`),
  ADD UNIQUE KEY `kode_4` (`kode`),
  ADD UNIQUE KEY `kode_5` (`kode`),
  ADD UNIQUE KEY `kode_6` (`kode`),
  ADD UNIQUE KEY `kode_7` (`kode`),
  ADD UNIQUE KEY `kode_8` (`kode`),
  ADD UNIQUE KEY `kode_9` (`kode`),
  ADD UNIQUE KEY `kode_10` (`kode`),
  ADD UNIQUE KEY `kode_11` (`kode`),
  ADD UNIQUE KEY `kode_12` (`kode`),
  ADD UNIQUE KEY `kode_13` (`kode`),
  ADD UNIQUE KEY `kode_14` (`kode`),
  ADD UNIQUE KEY `kode_15` (`kode`),
  ADD UNIQUE KEY `kode_16` (`kode`),
  ADD UNIQUE KEY `kode_17` (`kode`),
  ADD UNIQUE KEY `kode_18` (`kode`),
  ADD UNIQUE KEY `kode_19` (`kode`),
  ADD UNIQUE KEY `kode_20` (`kode`),
  ADD UNIQUE KEY `kode_21` (`kode`),
  ADD UNIQUE KEY `kode_22` (`kode`),
  ADD UNIQUE KEY `kode_23` (`kode`),
  ADD UNIQUE KEY `kode_24` (`kode`),
  ADD KEY `jurusan_id` (`jurusan_id`);

--
-- Indexes for table `orang_tua`
--
ALTER TABLE `orang_tua`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pegawai`
--
ALTER TABLE `pegawai`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`),
  ADD UNIQUE KEY `nip_2` (`nip`),
  ADD UNIQUE KEY `nip_3` (`nip`),
  ADD UNIQUE KEY `nip_4` (`nip`),
  ADD UNIQUE KEY `nip_5` (`nip`),
  ADD UNIQUE KEY `nip_6` (`nip`),
  ADD UNIQUE KEY `nip_7` (`nip`),
  ADD UNIQUE KEY `nip_8` (`nip`),
  ADD UNIQUE KEY `nip_9` (`nip`),
  ADD UNIQUE KEY `nip_10` (`nip`),
  ADD UNIQUE KEY `nip_11` (`nip`),
  ADD UNIQUE KEY `nip_12` (`nip`),
  ADD UNIQUE KEY `nip_13` (`nip`),
  ADD UNIQUE KEY `nip_14` (`nip`),
  ADD UNIQUE KEY `nip_15` (`nip`),
  ADD UNIQUE KEY `nip_16` (`nip`),
  ADD UNIQUE KEY `nip_17` (`nip`),
  ADD UNIQUE KEY `nip_18` (`nip`),
  ADD UNIQUE KEY `nip_19` (`nip`),
  ADD UNIQUE KEY `nip_20` (`nip`),
  ADD UNIQUE KEY `nip_21` (`nip`),
  ADD UNIQUE KEY `nip_22` (`nip`),
  ADD UNIQUE KEY `nip_23` (`nip`),
  ADD UNIQUE KEY `nip_24` (`nip`),
  ADD UNIQUE KEY `nip_25` (`nip`),
  ADD KEY `pegawai_nama` (`nama`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_permissions_permission_id_role_id_unique` (`role_id`,`permission_id`),
  ADD UNIQUE KEY `role_permissions_role_id_permission_id` (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `semester`
--
ALTER TABLE `semester`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tahun_pelajaran_id` (`tahun_pelajaran_id`);

--
-- Indexes for table `siswa`
--
ALTER TABLE `siswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nisn` (`nisn`),
  ADD UNIQUE KEY `nis` (`nis`),
  ADD UNIQUE KEY `nisn_2` (`nisn`),
  ADD UNIQUE KEY `nis_2` (`nis`),
  ADD UNIQUE KEY `nisn_3` (`nisn`),
  ADD UNIQUE KEY `nis_3` (`nis`),
  ADD UNIQUE KEY `nisn_4` (`nisn`),
  ADD UNIQUE KEY `nis_4` (`nis`),
  ADD UNIQUE KEY `nisn_5` (`nisn`),
  ADD UNIQUE KEY `nis_5` (`nis`),
  ADD UNIQUE KEY `nisn_6` (`nisn`),
  ADD UNIQUE KEY `nis_6` (`nis`),
  ADD UNIQUE KEY `nisn_7` (`nisn`),
  ADD UNIQUE KEY `nis_7` (`nis`),
  ADD UNIQUE KEY `nisn_8` (`nisn`),
  ADD UNIQUE KEY `nis_8` (`nis`),
  ADD UNIQUE KEY `nisn_9` (`nisn`),
  ADD UNIQUE KEY `nis_9` (`nis`),
  ADD UNIQUE KEY `nisn_10` (`nisn`),
  ADD UNIQUE KEY `nis_10` (`nis`),
  ADD UNIQUE KEY `nisn_11` (`nisn`),
  ADD UNIQUE KEY `nis_11` (`nis`),
  ADD UNIQUE KEY `nisn_12` (`nisn`),
  ADD UNIQUE KEY `nis_12` (`nis`),
  ADD UNIQUE KEY `nisn_13` (`nisn`),
  ADD UNIQUE KEY `nis_13` (`nis`),
  ADD UNIQUE KEY `nisn_14` (`nisn`),
  ADD UNIQUE KEY `nis_14` (`nis`),
  ADD UNIQUE KEY `nisn_15` (`nisn`),
  ADD UNIQUE KEY `nis_15` (`nis`),
  ADD UNIQUE KEY `nisn_16` (`nisn`),
  ADD UNIQUE KEY `nis_16` (`nis`),
  ADD UNIQUE KEY `nisn_17` (`nisn`),
  ADD UNIQUE KEY `nis_17` (`nis`),
  ADD UNIQUE KEY `nisn_18` (`nisn`),
  ADD UNIQUE KEY `nis_18` (`nis`),
  ADD UNIQUE KEY `nisn_19` (`nisn`),
  ADD UNIQUE KEY `nis_19` (`nis`),
  ADD UNIQUE KEY `nisn_20` (`nisn`),
  ADD UNIQUE KEY `nis_20` (`nis`),
  ADD UNIQUE KEY `nisn_21` (`nisn`),
  ADD UNIQUE KEY `nis_21` (`nis`),
  ADD UNIQUE KEY `nisn_22` (`nisn`),
  ADD UNIQUE KEY `nis_22` (`nis`),
  ADD UNIQUE KEY `nisn_23` (`nisn`),
  ADD UNIQUE KEY `nis_23` (`nis`),
  ADD UNIQUE KEY `nisn_24` (`nisn`),
  ADD UNIQUE KEY `nis_24` (`nis`),
  ADD UNIQUE KEY `nisn_25` (`nisn`),
  ADD UNIQUE KEY `nis_25` (`nis`),
  ADD KEY `siswa_nama` (`nama`),
  ADD KEY `siswa_nisn` (`nisn`),
  ADD KEY `siswa_status` (`status`),
  ADD KEY `siswa_jurusan_id` (`jurusan_id`),
  ADD KEY `orang_tua_id` (`orang_tua_id`);

--
-- Indexes for table `siswa_kelas`
--
ALTER TABLE `siswa_kelas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `siswa_kelas_siswa_id_kelas_id_tahun_pelajaran_id` (`siswa_id`,`kelas_id`,`tahun_pelajaran_id`),
  ADD KEY `kelas_id` (`kelas_id`),
  ADD KEY `tahun_pelajaran_id` (`tahun_pelajaran_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `tahun_pelajaran`
--
ALTER TABLE `tahun_pelajaran`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`),
  ADD UNIQUE KEY `nama_2` (`nama`),
  ADD UNIQUE KEY `nama_3` (`nama`),
  ADD UNIQUE KEY `nama_4` (`nama`),
  ADD UNIQUE KEY `nama_5` (`nama`),
  ADD UNIQUE KEY `nama_6` (`nama`),
  ADD UNIQUE KEY `nama_7` (`nama`),
  ADD UNIQUE KEY `nama_8` (`nama`),
  ADD UNIQUE KEY `nama_9` (`nama`),
  ADD UNIQUE KEY `nama_10` (`nama`),
  ADD UNIQUE KEY `nama_11` (`nama`),
  ADD UNIQUE KEY `nama_12` (`nama`),
  ADD UNIQUE KEY `nama_13` (`nama`),
  ADD UNIQUE KEY `nama_14` (`nama`),
  ADD UNIQUE KEY `nama_15` (`nama`),
  ADD UNIQUE KEY `nama_16` (`nama`),
  ADD UNIQUE KEY `nama_17` (`nama`),
  ADD UNIQUE KEY `nama_18` (`nama`),
  ADD UNIQUE KEY `nama_19` (`nama`),
  ADD UNIQUE KEY `nama_20` (`nama`),
  ADD UNIQUE KEY `nama_21` (`nama`),
  ADD UNIQUE KEY `nama_22` (`nama`),
  ADD UNIQUE KEY `nama_23` (`nama`),
  ADD UNIQUE KEY `nama_24` (`nama`),
  ADD UNIQUE KEY `nama_25` (`nama`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `username_6` (`username`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `username_7` (`username`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `username_8` (`username`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `username_9` (`username`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `username_10` (`username`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `username_11` (`username`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `username_12` (`username`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `username_13` (`username`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `username_14` (`username`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `username_15` (`username`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `username_16` (`username`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `username_17` (`username`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `username_18` (`username`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `username_19` (`username`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `username_20` (`username`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `username_21` (`username`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `username_22` (`username`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `username_23` (`username`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `username_24` (`username`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `username_25` (`username`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `guru_id` (`guru_id`),
  ADD KEY `siswa_id` (`siswa_id`),
  ADD KEY `pegawai_id` (`pegawai_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `guru`
--
ALTER TABLE `guru`
  ADD CONSTRAINT `guru_ibfk_1` FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `jurusan`
--
ALTER TABLE `jurusan`
  ADD CONSTRAINT `jurusan_ibfk_1` FOREIGN KEY (`kepala_jurusan_id`) REFERENCES `guru` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `kalender_akademik`
--
ALTER TABLE `kalender_akademik`
  ADD CONSTRAINT `kalender_akademik_ibfk_45` FOREIGN KEY (`tahun_pelajaran_id`) REFERENCES `tahun_pelajaran` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `kalender_akademik_ibfk_46` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `kelas`
--
ALTER TABLE `kelas`
  ADD CONSTRAINT `kelas_ibfk_69` FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `kelas_ibfk_70` FOREIGN KEY (`wali_kelas_id`) REFERENCES `guru` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `kelas_ibfk_71` FOREIGN KEY (`tahun_pelajaran_id`) REFERENCES `tahun_pelajaran` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `mata_pelajaran`
--
ALTER TABLE `mata_pelajaran`
  ADD CONSTRAINT `mata_pelajaran_ibfk_1` FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_47` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_48` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `semester`
--
ALTER TABLE `semester`
  ADD CONSTRAINT `semester_ibfk_1` FOREIGN KEY (`tahun_pelajaran_id`) REFERENCES `tahun_pelajaran` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `siswa`
--
ALTER TABLE `siswa`
  ADD CONSTRAINT `siswa_ibfk_47` FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `siswa_ibfk_48` FOREIGN KEY (`orang_tua_id`) REFERENCES `orang_tua` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `siswa_kelas`
--
ALTER TABLE `siswa_kelas`
  ADD CONSTRAINT `siswa_kelas_ibfk_89` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `siswa_kelas_ibfk_90` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `siswa_kelas_ibfk_91` FOREIGN KEY (`tahun_pelajaran_id`) REFERENCES `tahun_pelajaran` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `siswa_kelas_ibfk_92` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_93` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_94` FOREIGN KEY (`guru_id`) REFERENCES `guru` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_95` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_96` FOREIGN KEY (`pegawai_id`) REFERENCES `pegawai` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
